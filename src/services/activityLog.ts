// Log of imports, translations and AI re-parses: when it started, what was used, when it ended.
// Kept on this device (localStorage) and merged through the worker (/api/activity) so the
// log is shared across devices. Last 2000 entries.

import { reportEvent } from './telemetry';

export type LogKind = 'import' | 'translate' | 'reparse' | 'annotate';
export type LogStatus = 'running' | 'retrying' | 'done' | 'failed';

export interface LogEntry {
  id: string;
  kind: LogKind;
  label: string; // recipe title, URL or file name
  method?: string; // what was used, e.g. "Jina reader (recipe data)" or "Gemini"
  detail?: string; // result or error
  recipeId?: string; // the recipe it is about, so the log can link to it
  started: string; // ISO
  ended?: string; // ISO
  status: LogStatus;
  updated: number; // ms, decides which side wins when merging devices
  device: string;
  session?: string; // the page load that runs it: tells a closed page from another open tab
}

const STORAGE_KEY = 'gourmet_craft_activity_v1';
const DEVICE_KEY = 'gourmet_craft_device_id_v1';
const MAX_ENTRIES = 2000;

const hostOf = (label: string): string | undefined => {
  try {
    return new URL(label).host;
  } catch {
    return undefined; // not a URL (pasted text, photo name)
  }
};

const deviceId = (): string => {
  try {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id = Math.random().toString(36).slice(2, 10);
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch {
    return 'unknown';
  }
};

const load = (): LogEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

let entries: LogEntry[] = load();
let lastPushed = 0;
let pushTimer: number | undefined;
const listeners = new Set<() => void>();

// ---- which page is alive ----
// Imports, translations and annotations run inside the page. If the page is closed or reloaded, what it
// was running never finishes. Every page load gets a session id and keeps a heartbeat in localStorage,
// so a second open tab or window does not mistake the first one's work for abandoned work.
const SESSION = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
const ALIVE_KEY = 'gourmet_craft_alive_v1';
const BEAT_MS = 5000;
const STALE_MS = 150000; // background tabs run their timers slowly: allow a generous gap
const me = deviceId();

const readAlive = (): Record<string, number> => {
  try {
    return JSON.parse(localStorage.getItem(ALIVE_KEY) || '{}');
  } catch {
    return {};
  }
};

const writeAlive = (map: Record<string, number>) => {
  try {
    localStorage.setItem(ALIVE_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
};

const beat = () => {
  const map = readAlive();
  const now = Date.now();
  map[SESSION] = now;
  for (const [id, ts] of Object.entries(map)) if (now - ts > 86400000) delete map[id];
  writeAlive(map);
};

const INTERRUPTED_DETAIL = 'Interrupted: the page was closed or reloaded while this ran. It starts again the next time the app is open.';

// Entries of this device whose page is gone will never finish: mark them. Returns true when any changed.
function sweepInterrupted(): boolean {
  const alive = readAlive();
  const now = Date.now();
  let changed = false;
  entries = entries.map((e) => {
    if (e.device !== me || (e.status !== 'running' && e.status !== 'retrying')) return e;
    const ts = e.session ? alive[e.session] : undefined;
    if (e.session === SESSION || (ts !== undefined && now - ts < STALE_MS)) return e;
    changed = true;
    // "ended" is the last sign of life, so the duration is not stretched until the next page load
    return { ...e, status: 'failed' as LogStatus, detail: INTERRUPTED_DETAIL, ended: new Date(e.updated).toISOString(), updated: now };
  });
  return changed;
}

beat();
sweepInterrupted();
if (typeof window !== 'undefined') {
  const timer = window.setInterval(() => {
    beat();
    if (sweepInterrupted()) persist();
  }, BEAT_MS);
  (timer as unknown as { unref?: () => void }).unref?.();
  // Closing or reloading the page: say so right away, so the next load does not wait for the heartbeat to go stale
  window.addEventListener('pagehide', (event) => {
    if ((event as PageTransitionEvent).persisted) return; // page may come back from the back/forward cache
    const map = readAlive();
    delete map[SESSION];
    writeAlive(map);
  });
}

const persist = () => {
  // Another open tab may have logged things since this one loaded: merge instead of overwriting
  const stored = new Map(load().map((e) => [e.id, e]));
  for (const e of entries) {
    const other = stored.get(e.id);
    if (!other || e.updated >= other.updated) stored.set(e.id, e);
  }
  entries = [...stored.values()];
  entries = entries.sort((a, b) => b.started.localeCompare(a.started)).slice(0, MAX_ENTRIES);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // storage full: keep the in-memory log
  }
  listeners.forEach((cb) => cb());
  schedulePush();
};

export const getLog = (): LogEntry[] => entries;

export function subscribeLog(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function startLog(kind: LogKind, label: string, method?: string, recipeId?: string): string {
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  entries = [
    { id, kind, label, method, recipeId, started: new Date().toISOString(), status: 'running', updated: Date.now(), device: deviceId(), session: SESSION },
    ...entries,
  ];
  persist();
  return id;
}

export function updateLog(id: string, patch: Partial<Pick<LogEntry, 'method' | 'detail' | 'status' | 'label'>>): void {
  entries = entries.map((e) => (e.id === id ? { ...e, ...patch, updated: Date.now() } : e));
  persist();
  if (patch.status === 'retrying') {
    const e = entries.find((x) => x.id === id);
    if (e) reportEvent(`job_${e.kind}_retry`, 'warn', patch.detail, { method: e.method });
  }
}

export function finishLog(id: string, status: 'done' | 'failed', patch: Partial<Pick<LogEntry, 'method' | 'detail' | 'label' | 'recipeId'>> = {}): void {
  entries = entries.map((e) =>
    e.id === id ? { ...e, ...patch, status, ended: new Date().toISOString(), updated: Date.now() } : e
  );
  persist();
  const done = entries.find((e) => e.id === id);
  if (done) {
    // The same outcome goes to Workers Logs, so it can be queried and graphed there too
    reportEvent(`job_${done.kind}`, status === 'failed' ? 'warn' : 'info', done.detail, {
      status,
      method: done.method,
      ms: done.ended ? new Date(done.ended).getTime() - new Date(done.started).getTime() : undefined,
      host: done.kind === 'import' ? hostOf(done.label) : undefined,
    });
  }
}

/**
 * Add an entry for something that already happened elsewhere (the server did the work while the app was
 * closed). The id makes it idempotent: a second device applying the same result does not add it twice.
 */
export function recordLog(entry: {
  id: string;
  kind: LogKind;
  label: string;
  method?: string;
  detail?: string;
  recipeId?: string;
  started: number;
  ended: number;
  status: 'done' | 'failed';
}): void {
  if (entries.some((e) => e.id === entry.id)) return;
  entries = [
    {
      id: entry.id,
      kind: entry.kind,
      label: entry.label,
      method: entry.method,
      detail: entry.detail,
      recipeId: entry.recipeId,
      started: new Date(entry.started).toISOString(),
      ended: new Date(entry.ended).toISOString(),
      status: entry.status,
      updated: Date.now(),
      device: deviceId(),
    },
    ...entries,
  ];
  persist();
  reportEvent(`job_${entry.kind}`, entry.status === 'failed' ? 'warn' : 'info', entry.detail, {
    status: entry.status,
    method: entry.method,
    ms: entry.ended - entry.started,
    where: 'server',
  });
}

export function clearLog(): void {
  entries = [];
  lastPushed = Date.now();
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  listeners.forEach((cb) => cb());
  // Clearing is local only; other devices keep their copy of the shared log.
}

// ---- sync through the worker (silently skipped where there is no worker, e.g. local dev) ----

function schedulePush() {
  window.clearTimeout(pushTimer);
  pushTimer = window.setTimeout(() => void pushActivity(), 4000);
}

async function pushActivity(): Promise<void> {
  const dirty = entries.filter((e) => e.updated > lastPushed && e.status !== 'running' && e.status !== 'retrying');
  if (dirty.length === 0) return;
  const pushedAt = Math.max(...dirty.map((e) => e.updated));
  try {
    const res = await fetch('/api/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries: dirty }),
    });
    if (res.ok && res.headers.get('content-type')?.includes('application/json')) lastPushed = pushedAt;
  } catch {
    // offline: retried on the next change
  }
}

/** Merge the shared log from the worker into this device's log. */
export async function pullActivity(): Promise<void> {
  try {
    const res = await fetch('/api/activity', { cache: 'no-store' });
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) return;
    const remote: LogEntry[] = (await res.json()).entries || [];
    const byId = new Map(entries.map((e) => [e.id, e]));
    let changed = false;
    for (const r of remote) {
      const mine = byId.get(r.id);
      if (!mine || r.updated > mine.updated) {
        byId.set(r.id, r);
        changed = true;
      }
    }
    if (changed) {
      entries = [...byId.values()];
      persist();
    }
  } catch {
    // offline
  }
}
