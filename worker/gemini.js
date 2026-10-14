// The Gemini proxy, shared by the worker (production, previews) and the Vite dev server (local),
// so every environment behaves the same. The key comes from the environment it runs in:
// the GEMINI_API_KEY Worker secret, or GEMINI_API_KEY in .env.local for local development.
// It is never sent to the browser.

import { GeminiHttpError } from '../src/shared/geminiErrors.ts';

export const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';
export const DEFAULT_MODEL = 'gemini-flash-latest';
// Lighter, cheaper model used for work that tolerates it (annotation). Limits are counted per
// model, so it also spreads the load. If the alias does not exist, requests fall back to the default.
export const LIGHT_MODEL = 'gemini-flash-lite-latest';
export const MAX_BODY_BYTES = 12 * 1024 * 1024; // photos are sent as base64

const reply = (body, status = 200) => ({ status, body: typeof body === 'string' ? body : JSON.stringify(body) });

export function modelsFor(tier, env) {
  const main = env.GEMINI_MODEL || DEFAULT_MODEL;
  return tier === 'light' ? [env.GEMINI_MODEL_LIGHT || LIGHT_MODEL, main] : [main];
}

/**
 * @param {{ route: string, method: string, tier?: string|null, bodyText?: string,
 *           env: Record<string, string|undefined>, log?: (level: string, fields: object) => void }} args
 * @returns {Promise<{ status: number, body: string }>}
 */
export async function geminiProxy({ route, method, tier, bodyText = '', env, log = () => {} }) {
  if (route === 'status' && method === 'GET') return reply({ configured: !!env.GEMINI_API_KEY });

  if (!env.GEMINI_API_KEY) return reply({ error: 'not_configured' }, 503);

  if (route === 'verify' && method === 'GET') {
    const res = await fetch(`${env.GEMINI_BASE || GEMINI_BASE}/models?pageSize=1`, { headers: { 'x-goog-api-key': env.GEMINI_API_KEY } });
    if (res.ok) return reply({ ok: true, message: 'Key works.' });
    const body = await res.json().catch(() => null);
    return reply({ ok: false, message: body?.error?.message || `Google rejected the key (HTTP ${res.status}).` });
  }

  if (route === 'generate' && method === 'POST') {
    if (bodyText.length > MAX_BODY_BYTES) return reply({ error: 'too_large' }, 413);
    const models = modelsFor(tier, env);
    for (let i = 0; i < models.length; i++) {
      const started = Date.now();
      const res = await fetch(`${env.GEMINI_BASE || GEMINI_BASE}/models/${models[i]}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
        body: bodyText,
      });
      const text = await res.text();
      // Outcome and latency of the upstream call (never the request content or the key)
      log(res.ok ? 'info' : 'warn', {
        event: 'gemini_upstream',
        model: models[i],
        status: res.status,
        ms: Date.now() - started,
        requestBytes: bodyText.length,
        error: res.ok ? undefined : text.slice(0, 300),
      });
      // The model name does not exist (for example a missing alias): try the next one
      if (res.status === 404 && i < models.length - 1) continue;
      return reply(text, res.status);
    }
  }

  return reply('Not found', 404);
}

/**
 * Call Gemini from the worker itself (for background work) and return the parsed response.
 * Throws GeminiHttpError for a non-200 answer (so the caller can tell rate limits from a rejected key).
 * Same model choice and 404 fallback as the proxy.
 */
export async function generateContent(env, body, tier, log = () => {}) {
  const bodyText = JSON.stringify(body);
  const models = modelsFor(tier, env);
  for (let i = 0; i < models.length; i++) {
    const started = Date.now();
    const res = await fetch(`${env.GEMINI_BASE || GEMINI_BASE}/models/${models[i]}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
      body: bodyText,
    });
    const text = await res.text();
    log(res.ok ? 'info' : 'warn', {
      event: 'gemini_upstream',
      source: 'background',
      model: models[i],
      status: res.status,
      ms: Date.now() - started,
      requestBytes: bodyText.length,
      error: res.ok ? undefined : text.slice(0, 300),
    });
    if (res.status === 404 && i < models.length - 1) continue;
    if (!res.ok) throw new GeminiHttpError(res.status);
    return JSON.parse(text);
  }
  throw new GeminiHttpError(404);
}

// ---------------------------------------------------------------------------
// Batch API: asynchronous, half the price, and its own (separate) limits. Used for the background work.
// Create:  POST models/{model}:batchGenerateContent  { batch: { display_name, input_config: { requests: { requests: [
//            { request: <generateContent body>, metadata: { key } } ] } } } }   -> { name: "batches/..." }
// Poll:    GET batches/{id}  -> state JOB_STATE_PENDING | RUNNING | SUCCEEDED | FAILED | CANCELLED | EXPIRED,
//          results as inlined responses, each with the key it was sent with.
// The docs show a few spots for state and results, so every one of them is accepted.
// ---------------------------------------------------------------------------

const baseOf = (env) => env.GEMINI_BASE || GEMINI_BASE;
const headersOf = (env) => ({ 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY });

/**
 * Candidate models for batch jobs: the Flash-Lite family (the only one a free-tier key may batch), newest first,
 * preferring models that list batchGenerateContent. GEMINI_MODEL_BATCH, when set, is tried first.
 */
export async function batchModelCandidates(env, log = () => {}) {
  const fromEnv = env.GEMINI_MODEL_BATCH ? [env.GEMINI_MODEL_BATCH] : [];
  let discovered = [];
  try {
    const res = await fetch(`${baseOf(env)}/models?pageSize=1000`, { headers: headersOf(env) });
    if (res.ok) {
      const body = await res.json();
      const lite = (body.models || [])
        .filter((m) => /flash-lite/i.test(m.name) && !/image|tts|embedding|audio|live|robotics|computer/i.test(m.name))
        .map((m) => ({
          id: String(m.name).replace(/^models\//, ''),
          batch: (m.supportedGenerationMethods || []).includes('batchGenerateContent'),
          version: (String(m.name).match(/(\d+)(?:\.(\d+))?/) || []).slice(1).map((n) => Number(n || 0)),
          preview: /preview|exp/i.test(m.name),
        }));
      lite.sort((a, b) => Number(b.batch) - Number(a.batch) || Number(a.preview) - Number(b.preview) || b.version[0] - a.version[0] || (b.version[1] || 0) - (a.version[1] || 0));
      discovered = lite.map((m) => m.id);
    }
  } catch {
    // listing is a convenience; the alias below is still tried
  }
  log('info', { event: 'batch_models', discovered: discovered.slice(0, 4) });
  return [...new Set([...fromEnv, ...discovered.slice(0, 3), LIGHT_MODEL])];
}

/** Start a batch job. `requests` is [{ key, body }]. Returns its name ("batches/..."). Throws GeminiHttpError. */
export async function submitBatch(env, model, requests, displayName) {
  const res = await fetch(`${baseOf(env)}/models/${model}:batchGenerateContent`, {
    method: 'POST',
    headers: headersOf(env),
    body: JSON.stringify({
      batch: {
        display_name: displayName,
        input_config: { requests: { requests: requests.map((r) => ({ request: r.body, metadata: { key: r.key } })) } },
      },
    }),
  });
  const text = await res.text();
  if (!res.ok) throw new GeminiHttpError(res.status, text.slice(0, 300));
  const body = JSON.parse(text);
  const name = body.name || body.metadata?.name;
  if (!name) throw new Error('Gemini did not return a batch name.');
  return name;
}

/** Look at a batch job: { state, results } where results is a Map key -> { data } | { error } once it succeeded. */
export async function getBatch(env, name) {
  const res = await fetch(`${baseOf(env)}/${name}`, { headers: headersOf(env) });
  const text = await res.text();
  if (!res.ok) throw new GeminiHttpError(res.status, text.slice(0, 300));
  const body = JSON.parse(text);
  const state = body.metadata?.state || body.state || (body.done ? 'JOB_STATE_SUCCEEDED' : 'JOB_STATE_PENDING');
  let results = null;
  if (state === 'JOB_STATE_SUCCEEDED') {
    const found =
      body.response?.inlinedResponses?.inlinedResponses ||
      body.response?.inlinedResponses ||
      body.dest?.inlinedResponses?.inlinedResponses ||
      body.dest?.inlinedResponses ||
      body.inlinedResponses?.inlinedResponses ||
      body.inlinedResponses ||
      [];
    results = new Map();
    for (const entry of Array.isArray(found) ? found : []) {
      const key = entry?.metadata?.key;
      if (key) results.set(key, entry.response ? { data: entry.response } : { error: entry.error || { message: 'no response' } });
    }
  }
  return { state, results };
}
