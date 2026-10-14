// Reports JS errors and the outcome of background jobs to the worker (/api/log), which writes them
// to Workers Logs and to a ring buffer in KV. No recipe content is sent, only what went wrong.
// Silently does nothing where there is no worker (local dev).

export type TelemetryLevel = 'info' | 'warn' | 'error';

interface TelemetryEvent {
  ts: number;
  type: string;
  level: TelemetryLevel;
  message?: string;
  data?: Record<string, unknown>;
  count: number;
  device?: string;
  version: string;
  page: string;
}

const DEVICE_KEY = 'gourmet_craft_device_id_v1';
const FLUSH_MS = 5000;
const MAX_QUEUE = 100;

let queue: TelemetryEvent[] = [];
let timer: number | undefined;
let disabled = false; // no worker answered: stop trying

const device = (): string | undefined => {
  try {
    return localStorage.getItem(DEVICE_KEY) || undefined;
  } catch {
    return undefined;
  }
};

const page = (): string => {
  // path and hash route only, never a query string
  return `${window.location.pathname}${window.location.hash.split('?')[0]}`;
};

export function reportEvent(
  type: string,
  level: TelemetryLevel,
  message?: string,
  data?: Record<string, unknown>
): void {
  if (disabled) return;
  // The same error repeating (e.g. in a render loop) is counted, not sent again
  const last = queue[queue.length - 1];
  if (last && last.type === type && last.message === message && last.level === level) {
    last.count += 1;
    return;
  }
  if (queue.length >= MAX_QUEUE) queue.shift();
  queue.push({
    ts: Date.now(),
    type,
    level,
    message,
    data,
    count: 1,
    device: device(),
    version: typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : 'dev',
    page: page(),
  });
  schedule();
}

function schedule() {
  window.clearTimeout(timer);
  timer = window.setTimeout(() => void flush(), FLUSH_MS);
}

async function flush(useBeacon = false): Promise<void> {
  window.clearTimeout(timer);
  if (queue.length === 0 || disabled) return;
  const events = queue.splice(0, 50);
  const body = JSON.stringify({ events });
  try {
    if (useBeacon && navigator.sendBeacon) {
      navigator.sendBeacon('/api/log', new Blob([body], { type: 'application/json' }));
      return;
    }
    const res = await fetch('/api/log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) disabled = true;
  } catch {
    // offline: drop this batch rather than growing forever
  }
  if (queue.length > 0) schedule();
}

const shortStack = (e: unknown): string | undefined =>
  e instanceof Error && e.stack
    ? e.stack
        .split('\n')
        .slice(0, 4)
        .map((l) => l.replace(/https?:\/\/[^/]+/g, '').replace(/\?[^\s):]*/g, ''))
        .join(' | ')
    : undefined;

/** Catch errors nobody handled, and flush whatever is queued when the page closes. */
export function installTelemetry(): void {
  window.addEventListener('error', (event) => {
    reportEvent('js_error', 'error', event.message, {
      source: event.filename ? event.filename.replace(/^https?:\/\/[^/]+/, '').split('?')[0] : undefined,
      line: event.lineno,
      stack: shortStack(event.error),
    });
  });
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    reportEvent('unhandled_rejection', 'error', reason instanceof Error ? reason.message : String(reason), {
      stack: shortStack(reason),
    });
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') void flush(true);
  });
}
