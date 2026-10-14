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
