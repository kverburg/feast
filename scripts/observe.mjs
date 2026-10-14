#!/usr/bin/env node
// Summarises how Feast is doing, from the data the app and worker keep in Cloudflare KV:
//   activity   - last 2000 imports / translations / AI re-parses (what was used, duration, result)
//   clientlog  - last 1000 client events (JS errors, job failures and retries, sync conflicts)
// Needs `npx wrangler login` once. Read-only; it never touches recipes.
//
//   node scripts/observe.mjs              production
//   node scripts/observe.mjs --preview    the PR test database
//   node scripts/observe.mjs --days 3     only the last 3 days
//   node scripts/observe.mjs --json       raw numbers as JSON
import { execFileSync } from 'node:child_process';

const args = process.argv.slice(2);
const preview = args.includes('--preview');
const asJson = args.includes('--json');
const daysIdx = args.indexOf('--days');
const days = daysIdx >= 0 ? Number(args[daysIdx + 1]) || 7 : 7;
const since = Date.now() - days * 86400000;

function readKey(key) {
  try {
    const out = execFileSync(
      'npx',
      ['--yes', 'wrangler@4', 'kv', 'key', 'get', key, '--binding', 'FEAST', '--remote', ...(preview ? ['-c', 'wrangler.preview.toml'] : [])],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024 }
    );
    const start = out.indexOf('[');
    return start >= 0 ? JSON.parse(out.slice(start)) : [];
  } catch (e) {
    const msg = String(e.stderr || e.message);
    if (/not found|10009/i.test(msg)) return [];
    console.error(`Could not read "${key}": ${msg.split('\n').find((l) => l.trim()) || msg}`);
    process.exit(1);
  }
}

const percentile = (sorted, p) => (sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))] : null);
const fmtMs = (ms) => (ms == null ? '-' : ms < 1000 ? `${ms}ms` : ms < 60000 ? `${(ms / 1000).toFixed(1)}s` : `${Math.round(ms / 60000)}m`);
const top = (map, n = 8) => [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
const bump = (map, key, by = 1) => map.set(key, (map.get(key) || 0) + by);

const activity = readKey('activity').filter((e) => new Date(e.started).getTime() >= since);
const events = readKey('clientlog').filter((e) => e.ts >= since);

// ---- jobs ----
const jobs = {};
for (const e of activity) {
  const group = `${e.kind} / ${e.method || 'unknown method'}`;
  const g = (jobs[group] ||= { done: 0, failed: 0, running: 0, durations: [], errors: new Map() });
  if (e.status === 'done') g.done++;
  else if (e.status === 'failed') {
    g.failed++;
    bump(g.errors, (e.detail || 'no detail').slice(0, 90));
  } else g.running++;
  if (e.ended) g.durations.push(new Date(e.ended).getTime() - new Date(e.started).getTime());
}

// ---- client events ----
const byType = new Map();
const errors = new Map();
const versions = new Map();
const devices = new Set();
for (const e of events) {
  bump(byType, `${e.level}:${e.type}`, e.count || 1);
  if (e.level === 'error') bump(errors, `${e.type}: ${(e.message || '').slice(0, 100)}`, e.count || 1);
  bump(versions, e.version || '?');
  if (e.device) devices.add(e.device);
}

const summary = {
  scope: preview ? 'preview' : 'production',
  days,
  jobs: Object.fromEntries(
    Object.entries(jobs).map(([k, g]) => {
      const sorted = [...g.durations].sort((a, b) => a - b);
      return [k, { done: g.done, failed: g.failed, running: g.running, p50: percentile(sorted, 50), p95: percentile(sorted, 95), topErrors: top(g.errors, 3) }];
    })
  ),
  clientEvents: Object.fromEntries(byType),
  topErrors: top(errors),
  versions: Object.fromEntries(versions),
  devices: devices.size,
};

if (asJson) {
  console.log(JSON.stringify(summary, null, 2));
  process.exit(0);
}

console.log(`\nFeast activity, ${summary.scope}, last ${days} days  (${activity.length} jobs, ${events.length} client events, ${devices.size} devices)\n`);
console.log('JOBS (by kind / method)');
if (Object.keys(summary.jobs).length === 0) console.log('  nothing logged yet');
for (const [group, s] of Object.entries(summary.jobs)) {
  const total = s.done + s.failed;
  const rate = total ? `${Math.round((s.done / total) * 100)}% ok` : '-';
  console.log(`  ${group.padEnd(48)} ${String(s.done).padStart(4)} ok ${String(s.failed).padStart(3)} failed  ${rate.padStart(7)}  p50 ${fmtMs(s.p50)}  p95 ${fmtMs(s.p95)}`);
  for (const [err, n] of s.topErrors) console.log(`      ${n}x  ${err}`);
}
console.log('\nCLIENT EVENTS');
for (const [k, n] of top(byType, 12)) console.log(`  ${String(n).padStart(5)}  ${k}`);
if (summary.topErrors.length) {
  console.log('\nTOP ERRORS');
  for (const [k, n] of summary.topErrors) console.log(`  ${String(n).padStart(5)}x  ${k}`);
}
console.log('\nAPP VERSIONS SEEN  ' + ([...versions.entries()].map(([v, n]) => `${v} (${n})`).join(', ') || '-'));
console.log('');
