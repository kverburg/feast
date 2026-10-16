// AI providers behind one request shape. The tasks (src/shared/geminiTasks.ts) build Gemini-shaped request
// bodies; Gemini takes them as they are, and Mistral gets them translated here. Mistral's answer is turned
// back into Gemini's response shape, so the parsers (readJson) do not care which provider answered.
//
// Which provider runs which work is configuration: AI_PROVIDER ("gemini" by default, or "mistral") and
// AI_PROVIDER_LIGHT for the light tier (annotation). Models: MISTRAL_MODEL, MISTRAL_MODEL_LIGHT.

import { GeminiHttpError } from '../src/shared/geminiErrors.ts';

export const MISTRAL_BASE = 'https://api.mistral.ai/v1';
export const MISTRAL_DEFAULT_MODEL = 'mistral-small-latest';

export const providerFor = (env, tier) => {
  const chosen = (tier === 'light' && env.AI_PROVIDER_LIGHT) || env.AI_PROVIDER || 'gemini';
  return chosen === 'mistral' ? 'mistral' : 'gemini';
};

export const keyFor = (env, provider) => (provider === 'mistral' ? env.MISTRAL_API_KEY : env.GEMINI_API_KEY);

/** True when every provider that is in use has its key. */
export const aiReady = (env) => ['default', 'light'].every((tier) => !!keyFor(env, providerFor(env, tier)));

export const mistralModelFor = (env, tier) =>
  (tier === 'light' && env.MISTRAL_MODEL_LIGHT) || env.MISTRAL_MODEL || MISTRAL_DEFAULT_MODEL;

/** Gemini request body -> Mistral chat completion body. */
export function toMistralRequest(body, model) {
  const toContent = (parts) => {
    const out = [];
    for (const part of parts || []) {
      if (typeof part.text === 'string') out.push({ type: 'text', text: part.text });
      else if (part.inlineData) out.push({ type: 'image_url', image_url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` });
    }
    // plain text stays a string: the simplest shape, accepted by every model
    return out.length === 1 && out[0].type === 'text' ? out[0].text : out;
  };

  const messages = [];
  const system = body.systemInstruction?.parts?.map((p) => p.text || '').join('\n').trim();
  if (system) messages.push({ role: 'system', content: system });
  for (const c of body.contents || []) messages.push({ role: c.role === 'model' ? 'assistant' : 'user', content: toContent(c.parts) });

  const cfg = body.generationConfig || {};
  const out = { model, messages };
  if (typeof cfg.temperature === 'number') out.temperature = cfg.temperature;
  if (typeof cfg.maxOutputTokens === 'number') out.max_tokens = cfg.maxOutputTokens;
  if (cfg.responseMimeType === 'application/json') out.response_format = { type: 'json_object' };
  return out;
}

/** Mistral chat completion response -> the Gemini response shape the parsers read. */
export function fromMistralResponse(data) {
  const content = data?.choices?.[0]?.message?.content;
  const text = Array.isArray(content) ? content.map((c) => c.text || '').join('') : content || '';
  return {
    candidates: [{ content: { parts: [{ text }] }, finishReason: data?.choices?.[0]?.finish_reason }],
    usageMetadata: data?.usage
      ? { promptTokenCount: data.usage.prompt_tokens, candidatesTokenCount: data.usage.completion_tokens, totalTokenCount: data.usage.total_tokens }
      : undefined,
  };
}

/** Call Mistral with a Gemini-shaped body. Returns a Gemini-shaped response; throws GeminiHttpError for non-200. */
export async function mistralGenerate(env, body, tier, log = () => {}) {
  const model = mistralModelFor(env, tier);
  const request = JSON.stringify(toMistralRequest(body, model));
  const started = Date.now();
  const res = await fetch(`${env.MISTRAL_BASE || MISTRAL_BASE}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.MISTRAL_API_KEY}` },
    body: request,
  });
  const text = await res.text();
  log(res.ok ? 'info' : 'warn', {
    event: 'ai_upstream',
    provider: 'mistral',
    model,
    status: res.status,
    ms: Date.now() - started,
    requestBytes: request.length,
    error: res.ok ? undefined : text.slice(0, 300),
  });
  if (!res.ok) throw new GeminiHttpError(res.status, text.slice(0, 500));
  return fromMistralResponse(JSON.parse(text));
}

/** A tiny real request, for "Verify key". */
export async function probeMistral(env) {
  const model = mistralModelFor(env, 'default');
  try {
    await mistralGenerate(env, { contents: [{ role: 'user', parts: [{ text: 'Reply with {"ok":true}' }] }], generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 32 } }, 'default');
    return { ok: true, message: `Key works (${model} answered).` };
  } catch (e) {
    return { ok: false, message: `Mistral: ${e instanceof Error ? e.message : String(e)}` };
  }
}
