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

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // the app resizes uploads to ~200 KB first

// Recipe images uploaded from the edit form: stored in KV so they do not bloat the synced recipe state.
async function handleImage(url, req, env) {
  const id = url.pathname.slice('/api/image'.length).replace(/^\//, '');

  if (!id && req.method === 'POST') {
    const type = (req.headers.get('Content-Type') || '').split(';')[0];
    if (!IMAGE_TYPES.has(type)) return json({ error: 'unsupported_type' }, 415);
    const data = await req.arrayBuffer();
    if (data.byteLength === 0 || data.byteLength > MAX_IMAGE_BYTES) return json({ error: 'bad_size' }, 413);
    const newId = crypto.randomUUID();
    await env.FEAST.put(`img:${newId}`, data, { metadata: { type } });
    return json({ url: `/api/image/${newId}` });
  }

  if (id && req.method === 'GET') {
    if (!/^[0-9a-f-]{36}$/.test(id)) return new Response('Not found', { status: 404 });
    const { value, metadata } = await env.FEAST.getWithMetadata(`img:${id}`, 'arrayBuffer');
    if (!value) return new Response('Not found', { status: 404 });
    return new Response(value, {
      headers: {
        'Content-Type': metadata?.type || 'image/jpeg',
        'Cache-Control': 'private, max-age=31536000, immutable',
      },
    });
  }

  return new Response('Method not allowed', { status: 405 });
}

const MAX_ACTIVITY_ENTRIES = 2000;
const MAX_ACTIVITY_BODY = 1024 * 1024;

// Shared activity log (imports, translations): devices push entries and the worker merges them by id.
async function handleActivity(req, env) {
  const raw = await env.FEAST.get('activity');
  const current = raw ? JSON.parse(raw) : [];

  if (req.method === 'GET') return json({ entries: current });

  if (req.method === 'POST') {
    const text = await req.text();
    if (text.length > MAX_ACTIVITY_BODY) return json({ error: 'too_large' }, 413);
    let body;
    try { body = JSON.parse(text); } catch { return json({ error: 'bad json' }, 400); }
    if (!body || !Array.isArray(body.entries)) return json({ error: 'bad body' }, 400);

    const byId = new Map(current.map((e) => [e.id, e]));
    for (const e of body.entries) {
      if (!e || typeof e.id !== 'string' || typeof e.updated !== 'number' || typeof e.started !== 'string') continue;
      const mine = byId.get(e.id);
      if (!mine || e.updated > mine.updated) byId.set(e.id, e);
    }
    const merged = [...byId.values()]
      .sort((a, b) => b.started.localeCompare(a.started))
      .slice(0, MAX_ACTIVITY_ENTRIES);
    await env.FEAST.put('activity', JSON.stringify(merged));
    return json({ ok: true, count: merged.length });
  }

  return new Response('Method not allowed', { status: 405 });
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const isState = url.pathname === '/api/state';
    const isGemini = url.pathname.startsWith('/api/gemini/');
    const isImage = url.pathname === '/api/image' || url.pathname.startsWith('/api/image/');
    const isActivity = url.pathname === '/api/activity';
    if (!isState && !isGemini && !isImage && !isActivity) return env.ASSETS.fetch(req);

    // Cloudflare Access adds this header after login. Without it, refuse.
    if (!req.headers.get('Cf-Access-Jwt-Assertion')) return new Response('Forbidden', { status: 403 });

    if (isGemini) return handleGemini(url, req, env);
    if (isImage) return handleImage(url, req, env);
    if (isActivity) return handleActivity(req, env);

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
