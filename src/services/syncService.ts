// Syncs recipes and the shopping list to Cloudflare KV via /api/state.
// Hooks localStorage writes, so the rest of the app keeps using storageService unchanged.
// The Gemini API key is synced too (stored as a plain string); theme and voice setting stay per-device.
// Everything lives in KV behind Cloudflare Access, so only the allowed users can read it.
// If /api/state is unavailable (e.g. local dev), the app silently stays local-only.

const SYNCED_KEYS: Record<string, string> = {
  gourmet_craft_recipes_v1: 'recipes',
  gourmet_craft_shopping_v1: 'shopping',
  gourmet_craft_meals_v1: 'meals',
  gourmet_craft_gemini_key_v1: 'geminiKey',
};

// Stored as a raw string in localStorage, not JSON.
const RAW_KEYS = new Set(['gourmet_craft_gemini_key_v1']);

type SyncData = Record<string, unknown>;

const nativeSetItem = Storage.prototype.setItem;
let rev = 0;
let timer: number | undefined;

const readLocal = (): SyncData => {
  const out: SyncData = {};
  for (const [key, field] of Object.entries(SYNCED_KEYS)) {
    try {
      const raw = localStorage.getItem(key);
      out[field] = raw ? (RAW_KEYS.has(key) ? raw : JSON.parse(raw)) : null;
    } catch {
      out[field] = null;
    }
  }
  return out;
};

const writeLocal = (data: SyncData) => {
  for (const [key, field] of Object.entries(SYNCED_KEYS)) {
    if (data[field] == null) continue;
    nativeSetItem.call(localStorage, key, RAW_KEYS.has(key) ? String(data[field]) : JSON.stringify(data[field]));
  }
};

const push = async (keepalive = false) => {
  window.clearTimeout(timer);
  timer = undefined;
  try {
    const res = await fetch('/api/state', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rev, data: readLocal() }),
      keepalive,
    });
    if (res.status === 409) {
      const remote = await res.json();
      writeLocal(remote.data ?? {});
      rev = remote.rev;
      alert('Your recipes were changed on another device. Loading the latest version.');
      location.reload();
    } else if (res.ok) {
      rev = (await res.json()).rev;
    }
  } catch {
    // offline: local copy is kept, next save retries
  }
};

const schedulePush = () => {
  window.clearTimeout(timer);
  timer = window.setTimeout(() => void push(), 800);
};

export const initSync = async (): Promise<void> => {
  let remote: { rev: number; data: SyncData | null };
  try {
    const res = await fetch('/api/state', { cache: 'no-store' });
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) return;
    remote = await res.json();
    rev = remote.rev;
    if (remote.data) writeLocal(remote.data);
  } catch {
    return;
  }

  Storage.prototype.setItem = function (key: string, value: string) {
    nativeSetItem.call(this, key, value);
    if (this === localStorage && key in SYNCED_KEYS) schedulePush();
  };
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && timer !== undefined) void push(true);
  });

  // Upload anything this browser has that KV doesn't yet (first run, or a newly synced key such as the API key).
  const local = readLocal();
  const missingRemotely = Object.keys(local).some((f) => local[f] != null && remote.data?.[f] == null);
  if (missingRemotely) void push();
};
