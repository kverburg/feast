import test from 'node:test';
import assert from 'node:assert/strict';
import { toMistralRequest, fromMistralResponse, providerFor, aiReady, mistralGenerate } from '../worker/providers.js';
import { generateContent } from '../worker/gemini.js';
import { readJson } from '../src/shared/geminiTasks.ts';
import { GeminiHttpError } from '../src/shared/geminiErrors.ts';

const jsonBody = (text) => ({ contents: [{ parts: [{ text }] }], generationConfig: { responseMimeType: 'application/json', temperature: 0.2 } });

test('provider selection and readiness', () => {
  assert.equal(providerFor({}, 'default'), 'gemini');
  assert.equal(providerFor({ AI_PROVIDER: 'mistral' }, 'light'), 'mistral');
  assert.equal(providerFor({ AI_PROVIDER: 'mistral', AI_PROVIDER_LIGHT: 'gemini' }, 'light'), 'gemini');
  assert.equal(aiReady({ GEMINI_API_KEY: 'k' }), true);
  assert.equal(aiReady({ AI_PROVIDER: 'mistral', GEMINI_API_KEY: 'k' }), false);
  assert.equal(aiReady({ AI_PROVIDER: 'mistral', AI_PROVIDER_LIGHT: 'gemini', MISTRAL_API_KEY: 'm' }), false);
  assert.equal(aiReady({ AI_PROVIDER: 'mistral', AI_PROVIDER_LIGHT: 'gemini', MISTRAL_API_KEY: 'm', GEMINI_API_KEY: 'k' }), true);
});

test('Gemini body becomes a Mistral chat request', () => {
  const req = toMistralRequest(jsonBody('hello'), 'mistral-small-latest');
  assert.deepEqual(req, { model: 'mistral-small-latest', messages: [{ role: 'user', content: 'hello' }], temperature: 0.2, response_format: { type: 'json_object' } });
});

test('system instruction and images are carried over', () => {
  const req = toMistralRequest(
    { systemInstruction: { parts: [{ text: 'Be brief' }] }, contents: [{ parts: [{ text: 'what is this' }, { inlineData: { mimeType: 'image/png', data: 'AAA' } }] }], generationConfig: { maxOutputTokens: 50 } },
    'm'
  );
  assert.equal(req.messages[0].role, 'system');
  assert.deepEqual(req.messages[1].content, [{ type: 'text', text: 'what is this' }, { type: 'image_url', image_url: 'data:image/png;base64,AAA' }]);
  assert.equal(req.max_tokens, 50);
  assert.equal(req.response_format, undefined);
});

test('Mistral answer is readable by the Gemini parsers', () => {
  const out = fromMistralResponse({ choices: [{ message: { content: '```json\n{"a":1}\n```' }, finish_reason: 'stop' }], usage: { prompt_tokens: 3, completion_tokens: 4, total_tokens: 7 } });
  assert.deepEqual(readJson(out), { a: 1 });
  assert.equal(out.usageMetadata.totalTokenCount, 7);
});

test('generateContent routes to Mistral and surfaces refusals as GeminiHttpError', async () => {
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), auth: init.headers.Authorization, body: JSON.parse(init.body) });
    return calls.length === 1
      ? new Response(JSON.stringify({ choices: [{ message: { content: '{"ok":true}' } }] }))
      : new Response(JSON.stringify({ message: 'Unprocessable' }), { status: 422 });
  };
  const env = { AI_PROVIDER: 'mistral', MISTRAL_API_KEY: 'mk', MISTRAL_MODEL_LIGHT: 'mistral-small-2' };
  assert.deepEqual(readJson(await generateContent(env, jsonBody('x'), 'light')), { ok: true });
  assert.equal(calls[0].url, 'https://api.mistral.ai/v1/chat/completions');
  assert.equal(calls[0].auth, 'Bearer mk');
  assert.equal(calls[0].body.model, 'mistral-small-2');
  await assert.rejects(() => mistralGenerate(env, jsonBody('x'), 'default'), (e) => e instanceof GeminiHttpError && e.status === 422);
});
