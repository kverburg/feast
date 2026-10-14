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
  started: string; // ISO
  ended?: string; // ISO
  status: LogStatus;
  updated: number; // ms, decides which side wins when merging devices
  device: string;
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

// Entries this device left running when the page closed will never finish.
const now0 = Date.now();
const me = deviceId();
entries = entries.map((e) =>
  e.device === me && (e.status === 'running' || e.status === 'retrying')
    ? { ...e, status: 'failed' as LogStatus, detail: 'Interrupted (app was closed)', ended: new Date(now0).toISOString(), updated: now0 }
    : e
);

const persist = () => {
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

export function startLog(kind: LogKind, label: string, method?: string): string {
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  entries = [
    { id, kind, label, method, started: new Date().toISOString(), status: 'running', updated: Date.now(), device: deviceId() },
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

export function finishLog(id: string, status: 'done' | 'failed', patch: Partial<Pick<LogEntry, 'method' | 'detail' | 'label'>> = {}): void {
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
