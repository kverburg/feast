import { geminiProxy } from './gemini.js';
import { processWork, readWork, acknowledge, clipWorkList, pendingEntries, addImport } from './work.js';
import { aiReady } from './providers.js';

// Feast: serves the app (static assets) and stores one shared state in KV.
const json = (o, status = 200) =>
  new Response(JSON.stringify(o), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

// Gemini proxy: the key lives only in the GEMINI_API_KEY Worker secret, never in the browser.
// The logic is shared with the local dev server (see gemini.js).
async function handleGemini(url, req, env) {
  const route = url.pathname.slice('/api/gemini/'.length);
  const bodyText = req.method === 'POST' ? await req.text() : '';
  const r = await geminiProxy({ route, method: req.method, tier: url.searchParams.get('tier'), bodyText, env, log });
  return new Response(r.body, {
    status: r.status,
    headers: { 'Content-Type': r.status === 404 ? 'text/plain' : 'application/json', 'Cache-Control': 'no-store' },
  });
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

// Background work (translating and annotating recipes): see work.js
async function handleWork(url, req, env, ctx) {
  if (url.pathname === '/api/work/ack' && req.method === 'POST') {
    let body;
    try { body = await req.json(); } catch { return json({ error: 'bad json' }, 400); }
    return json({ ok: true, removed: await acknowledge(env, body && body.keys) });
  }

  if (url.pathname === '/api/work/import' && req.method === 'POST') {
    let body;
    try { body = await req.json(); } catch { return json({ error: 'bad json' }, 400); }
    if (!(await addImport(env, body))) return json({ error: 'rejected' }, 400);
    if (ctx) ctx.waitUntil(processWork(env, { log }));
    return json({ ok: true });
  }

  if (url.pathname === '/api/work/retry' && req.method === 'POST') {
    const doc = await readWork(env);
    doc.status = { state: 'idle', note: '', nextAt: 0, failures: 0, updatedAt: Date.now() };
    doc.attempts = {};
    doc.batchOff = null;
    await writeWork(env, doc);
    if (ctx) ctx.waitUntil(processWork(env, { log }));
    return json({ ok: true });
  }

  if (url.pathname === '/api/work' && req.method === 'GET') {
    const enabled = aiReady(env); // the server needs its own key for the provider(s) in use to work in the background
    const [doc, pending] = enabled ? await Promise.all([readWork(env), pendingEntries(env)]) : [null, []];
    // Previews have no cron: while the app is open, polling moves the work along instead
    if (enabled && env.PUMP_ON_POLL === 'true' && pending.length > 0 && ctx) ctx.waitUntil(processWork(env, { log }));
    const batchOff = doc && doc.batchOff && doc.batchOff.until > Date.now() ? doc.batchOff.note : null;
    return json({
      enabled,
      status: doc ? doc.status : null,
      patches: doc ? doc.patches : [],
      pending: pending.length + (doc ? doc.imports.length : 0),
      imports: doc ? doc.imports.length : 0,
      // recipes whose requests are with Gemini's batch queue, so the app can show them as "waiting on response"
      batches: doc ? doc.batches.map((b) => ({ name: b.name, model: b.model, submittedAt: b.submittedAt, items: b.items.map((i) => ({ key: i.key, label: i.label })) })) : [],
      batch: { active: doc ? doc.batches.length : 0, off: env.GEMINI_BATCH === 'off' ? 'Batch is switched off; using direct calls' : batchOff },
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

// Structured logs: with [observability] enabled in wrangler.toml they land in Workers Logs
// (dashboard > Workers & Pages > feast > Observability), where every field below is searchable.
const log = (level, fields) => {
  const line = { app: 'feast', ...fields };
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
};

const MAX_CLIENT_EVENTS_STORED = 1000;
const clip = (v, n) => (typeof v === 'string' ? v.slice(0, n) : v === undefined || v === null ? undefined : String(v).slice(0, n));

// Events reported by the app itself: JS errors and the outcome of background jobs.
// They go to Workers Logs (7 days) and to a ring buffer in KV ('clientlog', last 1000)
// so they can be read later with `wrangler kv key get clientlog`.
async function handleClientLog(req, env) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const text = await req.text();
  if (text.length > 64 * 1024) return json({ error: 'too_large' }, 413);
  let body;
  try { body = JSON.parse(text); } catch { return json({ error: 'bad json' }, 400); }
  if (!body || !Array.isArray(body.events)) return json({ error: 'bad body' }, 400);

  const events = body.events.slice(0, 50).map((e) => ({
    ts: typeof e.ts === 'number' ? e.ts : Date.now(),
    type: clip(e.type, 40) || 'unknown',
    level: ['info', 'warn', 'error'].includes(e.level) ? e.level : 'info',
    message: clip(e.message, 500),
    data: e.data && typeof e.data === 'object' ? JSON.parse(JSON.stringify(e.data, (k, v) => (typeof v === 'string' ? v.slice(0, 300) : v))) : undefined,
    count: typeof e.count === 'number' ? e.count : 1,
    device: clip(e.device, 20),
    version: clip(e.version, 20),
    page: clip(e.page, 80),
  }));

  for (const e of events) log(e.level, { event: 'client', ...e });

  const raw = await env.FEAST.get('clientlog');
  const current = raw ? JSON.parse(raw) : [];
  await env.FEAST.put('clientlog', JSON.stringify([...events.reverse(), ...current].slice(0, MAX_CLIENT_EVENTS_STORED)));
  return json({ ok: true, stored: events.length });
}

// Benchmark results written by bench/run.mjs straight into KV (bench:index = summaries, bench:run:<id> = one run)
async function handleBench(url, req, env) {
  if (req.method !== 'GET') return new Response('Method not allowed', { status: 405 });
  if (url.pathname === '/api/bench/run') {
    const id = url.searchParams.get('id') || '';
    if (!/^[A-Za-z0-9_-]{1,120}$/.test(id)) return json({ error: 'bad id' }, 400);
    const raw = await env.FEAST.get(`bench:run:${id}`);
    return raw ? new Response(raw, { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } }) : json({ error: 'not found' }, 404);
  }
  const raw = await env.FEAST.get('bench:index');
  return new Response(raw || '[]', { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
}

async function route(req, env, ctx) {
  const url = new URL(req.url);
  const isState = url.pathname === '/api/state';
  const isGemini = url.pathname.startsWith('/api/gemini/');
  const isImage = url.pathname === '/api/image' || url.pathname.startsWith('/api/image/');
  const isActivity = url.pathname === '/api/activity';
  const isClientLog = url.pathname === '/api/log';
  const isWork = url.pathname === '/api/work' || url.pathname === '/api/work/ack' || url.pathname === '/api/work/retry' || url.pathname === '/api/work/import';
  const isBench = url.pathname === '/api/bench' || url.pathname === '/api/bench/run';
  if (!isState && !isBench && !isGemini && !isImage && !isActivity && !isClientLog && !isWork) return env.ASSETS.fetch(req);

  // Cloudflare Access adds this header after login. Without it, refuse.
  // (DEV_SKIP_ACCESS is only ever set in .dev.vars for running the worker locally.)
  if (!req.headers.get('Cf-Access-Jwt-Assertion') && env.DEV_SKIP_ACCESS !== '1') return new Response('Forbidden', { status: 403 });

  if (isWork) return handleWork(url, req, env, ctx);
  if (isBench) return handleBench(url, req, env);
  if (isGemini) return handleGemini(url, req, env);
  if (isImage) return handleImage(url, req, env);
  if (isActivity) return handleActivity(req, env);
  if (isClientLog) return handleClientLog(req, env);

  const raw = await env.FEAST.get('state');
  const current = raw ? JSON.parse(raw) : { rev: 0, data: null };

  if (req.method === 'GET') return json(current);

  if (req.method === 'PUT') {
    let body;
    try { body = await req.json(); } catch { return json({ error: 'bad json' }, 400); }
    if (!body || typeof body.data !== 'object' || body.data === null) return json({ error: 'bad body' }, 400);
    if (body.rev !== current.rev) {
      log('warn', { event: 'state_conflict', clientRev: body.rev, serverRev: current.rev });
      return json(current, 409); // someone saved in between
    }
    const next = { rev: current.rev + 1, data: body.data };
    // What is waiting for background work travels as metadata, so the cron run can read it without the state
    await env.FEAST.put('state', JSON.stringify(next), { metadata: { work: clipWorkList(body.work) } });
    return json({ rev: next.rev });
  }
  return new Response('Method not allowed', { status: 405 });
}

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    const started = Date.now();
    try {
      const res = await route(req, env, ctx);
      if (url.pathname.startsWith('/api/')) {
        // One line per API call: route, status and time. 4xx/5xx are warnings so they stand out.
        const path = url.pathname.startsWith('/api/image/') ? '/api/image/:id' : url.pathname;
        log(res.status >= 500 ? 'error' : res.status >= 400 ? 'warn' : 'info', {
          event: 'request',
          method: req.method,
          path,
          status: res.status,
          ms: Date.now() - started,
        });
      }
      return res;
    } catch (e) {
      log('error', { event: 'unhandled_error', path: url.pathname, method: req.method, message: String(e && e.message ? e.message : e), stack: e && e.stack ? String(e.stack).split('\n').slice(0, 4).join(' | ') : undefined });
      return json({ error: 'internal_error' }, 500);
    }
  },
  // Cron (every minute, production only): work on what the app reported as waiting, even with every device closed
  async scheduled(event, env, ctx) {
    ctx.waitUntil(
      processWork(env, { log }).then((result) => {
        if (!['idle', 'no_key', 'nothing_to_do', 'backing_off'].includes(result)) log('info', { event: 'cron_work', result });
      })
    );
  },
};
