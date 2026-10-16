// tests/providers.test.mjs
import test from "node:test";
import assert from "node:assert/strict";

// src/shared/geminiErrors.ts
var GeminiHttpError = class extends Error {
  constructor(status, detail) {
    super(`Gemini API returned status ${status}${detail ? `: ${summarizeDetail(detail)}` : ""}`);
    this.status = status;
    this.detail = detail;
  }
};
var summarizeDetail = (detail) => {
  try {
    const message = JSON.parse(detail)?.error?.message;
    if (typeof message === "string") return message.slice(0, 200);
  } catch {
  }
  return detail.slice(0, 200);
};

// worker/providers.js
var MISTRAL_BASE = "https://api.mistral.ai/v1";
var MISTRAL_DEFAULT_MODEL = "mistral-small-latest";
var providerFor = (env, tier) => {
  const chosen = tier === "light" && env.AI_PROVIDER_LIGHT || env.AI_PROVIDER || "gemini";
  return chosen === "mistral" ? "mistral" : "gemini";
};
var keyFor = (env, provider) => provider === "mistral" ? env.MISTRAL_API_KEY : env.GEMINI_API_KEY;
var aiReady = (env) => ["default", "light"].every((tier) => !!keyFor(env, providerFor(env, tier)));
var mistralModelFor = (env, tier) => tier === "light" && env.MISTRAL_MODEL_LIGHT || env.MISTRAL_MODEL || MISTRAL_DEFAULT_MODEL;
function toMistralRequest(body, model) {
  const toContent = (parts) => {
    const out2 = [];
    for (const part of parts || []) {
      if (typeof part.text === "string") out2.push({ type: "text", text: part.text });
      else if (part.inlineData) out2.push({ type: "image_url", image_url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` });
    }
    return out2.length === 1 && out2[0].type === "text" ? out2[0].text : out2;
  };
  const messages = [];
  const system = body.systemInstruction?.parts?.map((p) => p.text || "").join("\n").trim();
  if (system) messages.push({ role: "system", content: system });
  for (const c of body.contents || []) messages.push({ role: c.role === "model" ? "assistant" : "user", content: toContent(c.parts) });
  const cfg = body.generationConfig || {};
  const out = { model, messages };
  if (typeof cfg.temperature === "number") out.temperature = cfg.temperature;
  if (typeof cfg.maxOutputTokens === "number") out.max_tokens = cfg.maxOutputTokens;
  if (cfg.responseMimeType === "application/json") out.response_format = { type: "json_object" };
  return out;
}
function fromMistralResponse(data) {
  const content = data?.choices?.[0]?.message?.content;
  const text = Array.isArray(content) ? content.map((c) => c.text || "").join("") : content || "";
  return {
    candidates: [{ content: { parts: [{ text }] }, finishReason: data?.choices?.[0]?.finish_reason }],
    usageMetadata: data?.usage ? { promptTokenCount: data.usage.prompt_tokens, candidatesTokenCount: data.usage.completion_tokens, totalTokenCount: data.usage.total_tokens } : void 0
  };
}
async function mistralGenerate(env, body, tier, log = () => {
}) {
  const model = mistralModelFor(env, tier);
  const request = JSON.stringify(toMistralRequest(body, model));
  const started = Date.now();
  const res = await fetch(`${env.MISTRAL_BASE || MISTRAL_BASE}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${env.MISTRAL_API_KEY}` },
    body: request
  });
  const text = await res.text();
  log(res.ok ? "info" : "warn", {
    event: "ai_upstream",
    provider: "mistral",
    model,
    status: res.status,
    ms: Date.now() - started,
    requestBytes: request.length,
    error: res.ok ? void 0 : text.slice(0, 300)
  });
  if (!res.ok) throw new GeminiHttpError(res.status, text.slice(0, 500));
  return fromMistralResponse(JSON.parse(text));
}

// worker/gemini.js
var GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";
var DEFAULT_MODEL = "gemini-flash-latest";
var LIGHT_MODEL = "gemini-flash-lite-latest";
var MAX_BODY_BYTES = 12 * 1024 * 1024;
function modelsFor(tier, env) {
  const main = env.GEMINI_MODEL || DEFAULT_MODEL;
  return tier === "light" ? [env.GEMINI_MODEL_LIGHT || LIGHT_MODEL, main] : [main];
}
async function generateContent(env, body, tier, log = () => {
}) {
  if (providerFor(env, tier) === "mistral") return mistralGenerate(env, body, tier, log);
  const bodyText = JSON.stringify(body);
  const models = modelsFor(tier, env);
  for (let i = 0; i < models.length; i++) {
    const started = Date.now();
    const res = await fetch(`${env.GEMINI_BASE || GEMINI_BASE}/models/${models[i]}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
      body: bodyText
    });
    const text = await res.text();
    log(res.ok ? "info" : "warn", {
      event: "gemini_upstream",
      source: "background",
      model: models[i],
      status: res.status,
      ms: Date.now() - started,
      requestBytes: bodyText.length,
      error: res.ok ? void 0 : text.slice(0, 300)
    });
    if (res.status === 404 && i < models.length - 1) continue;
    if (!res.ok) throw new GeminiHttpError(res.status, text.slice(0, 500));
    return JSON.parse(text);
  }
  throw new GeminiHttpError(404);
}

// src/shared/geminiTasks.ts
function readJson(data) {
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, ""));
}

// tests/providers.test.mjs
var jsonBody = (text) => ({ contents: [{ parts: [{ text }] }], generationConfig: { responseMimeType: "application/json", temperature: 0.2 } });
test("provider selection and readiness", () => {
  assert.equal(providerFor({}, "default"), "gemini");
  assert.equal(providerFor({ AI_PROVIDER: "mistral" }, "light"), "mistral");
  assert.equal(providerFor({ AI_PROVIDER: "mistral", AI_PROVIDER_LIGHT: "gemini" }, "light"), "gemini");
  assert.equal(aiReady({ GEMINI_API_KEY: "k" }), true);
  assert.equal(aiReady({ AI_PROVIDER: "mistral", GEMINI_API_KEY: "k" }), false);
  assert.equal(aiReady({ AI_PROVIDER: "mistral", AI_PROVIDER_LIGHT: "gemini", MISTRAL_API_KEY: "m" }), false);
  assert.equal(aiReady({ AI_PROVIDER: "mistral", AI_PROVIDER_LIGHT: "gemini", MISTRAL_API_KEY: "m", GEMINI_API_KEY: "k" }), true);
});
test("Gemini body becomes a Mistral chat request", () => {
  const req = toMistralRequest(jsonBody("hello"), "mistral-small-latest");
  assert.deepEqual(req, { model: "mistral-small-latest", messages: [{ role: "user", content: "hello" }], temperature: 0.2, response_format: { type: "json_object" } });
});
test("system instruction and images are carried over", () => {
  const req = toMistralRequest(
    { systemInstruction: { parts: [{ text: "Be brief" }] }, contents: [{ parts: [{ text: "what is this" }, { inlineData: { mimeType: "image/png", data: "AAA" } }] }], generationConfig: { maxOutputTokens: 50 } },
    "m"
  );
  assert.equal(req.messages[0].role, "system");
  assert.deepEqual(req.messages[1].content, [{ type: "text", text: "what is this" }, { type: "image_url", image_url: "data:image/png;base64,AAA" }]);
  assert.equal(req.max_tokens, 50);
  assert.equal(req.response_format, void 0);
});
test("Mistral answer is readable by the Gemini parsers", () => {
  const out = fromMistralResponse({ choices: [{ message: { content: '```json\n{"a":1}\n```' }, finish_reason: "stop" }], usage: { prompt_tokens: 3, completion_tokens: 4, total_tokens: 7 } });
  assert.deepEqual(readJson(out), { a: 1 });
  assert.equal(out.usageMetadata.totalTokenCount, 7);
});
test("generateContent routes to Mistral and surfaces refusals as GeminiHttpError", async () => {
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), auth: init.headers.Authorization, body: JSON.parse(init.body) });
    return calls.length === 1 ? new Response(JSON.stringify({ choices: [{ message: { content: '{"ok":true}' } }] })) : new Response(JSON.stringify({ message: "Unprocessable" }), { status: 422 });
  };
  const env = { AI_PROVIDER: "mistral", MISTRAL_API_KEY: "mk", MISTRAL_MODEL_LIGHT: "mistral-small-2" };
  assert.deepEqual(readJson(await generateContent(env, jsonBody("x"), "light")), { ok: true });
  assert.equal(calls[0].url, "https://api.mistral.ai/v1/chat/completions");
  assert.equal(calls[0].auth, "Bearer mk");
  assert.equal(calls[0].body.model, "mistral-small-2");
  await assert.rejects(() => mistralGenerate(env, jsonBody("x"), "default"), (e) => e instanceof GeminiHttpError && e.status === 422);
});
