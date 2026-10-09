// Feast: serves the app (static assets) and stores one shared state in KV.
const json = (o, status = 200) =>
  new Response(JSON.stringify(o), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_MODEL = 'gemini-flash-latest';
const MAX_BODY_BYTES = 12 * 1024 * 1024; // photos are sent as base64

// Gemini proxy: the key lives only in the GEMINI_API_KEY Worker secret, never in the browser.
async function handleGemini(url, req, env) {
  const route = url.pathname.slice('/api/gemini/'.length);

  if (route === 'status' && req.method === 'GET') return json({ configured: !!env.GEMINI_API_KEY });

  if (!env.GEMINI_API_KEY) return json({ error: 'not_configured' }, 503);

  if (route === 'verify' && req.method === 'GET') {
    const res = await fetch(`${GEMINI_BASE}/models?pageSize=1`, { headers: { 'x-goog-api-key': env.GEMINI_API_KEY } });
    if (res.ok) return json({ ok: true, message: 'Key works.' });
    const body = await res.json().catch(() => null);
    return json({ ok: false, message: body?.error?.message || `Google rejected the key (HTTP ${res.status}).` });
  }

  if (route === 'generate' && req.method === 'POST') {
    const text = await req.text();
    if (text.length > MAX_BODY_BYTES) return json({ error: 'too_large' }, 413);
    const res = await fetch(`${GEMINI_BASE}/models/${GEMINI_MODEL}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
      body: text,
    });
    return new Response(res.body, {
      status: res.status,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  }

  return new Response('Not found', { status: 404 });
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const isState = url.pathname === '/api/state';
    const isGemini = url.pathname.startsWith('/api/gemini/');
    if (!isState && !isGemini) return env.ASSETS.fetch(req);

    // Cloudflare Access adds this header after login. Without it, refuse.
    if (!req.headers.get('Cf-Access-Jwt-Assertion')) return new Response('Forbidden', { status: 403 });

    if (isGemini) return handleGemini(url, req, env);

    const raw = await env.FEAST.get('state');
    const current = raw ? JSON.parse(raw) : { rev: 0, data: null };

    if (req.method === 'GET') return json(current);

    if (req.method === 'PUT') {
      let body;
      try { body = await req.json(); } catch { return json({ error: 'bad json' }, 400); }
      if (!body || typeof body.data !== 'object' || body.data === null) return json({ error: 'bad body' }, 400);
      if (body.rev !== current.rev) return json(current, 409); // someone saved in between
      const next = { rev: current.rev + 1, data: body.data };
      await env.FEAST.put('state', JSON.stringify(next));
      return json({ rev: next.rev });
    }
    return new Response('Method not allowed', { status: 405 });
  },
};
