import { useEffect, useState } from 'react';
import { fetchProposals } from './feedbackService';
import { showToast } from './toast';

// How many recipes wait for the cook to check them, kept current while the app is open (push notifications cover
// the time the app is closed). A toast says so when a new one becomes ready.
const SEEN_KEY = 'gourmet_craft_seen_proposals_v1';
const POLL_MS = 60_000;

let count = 0;
let started = false;
const listeners = new Set<(n: number) => void>();
const setCount = (n: number) => {
  if (n === count) return;
  count = n;
  listeners.forEach((cb) => cb(n));
};

const readSeen = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY) || '[]');
  } catch {
    return [];
  }
};

/** Look now (also called after the user decides something). */
export async function refreshReviewCount(openReview?: () => void): Promise<void> {
  const list = await fetchProposals();
  if (!list) return;
  const ready = list.filter((p) => p.status === 'ready');
  setCount(ready.length);
  const seen = new Set(readSeen());
  const fresh = ready.filter((p) => !seen.has(p.id));
  if (fresh.length > 0) {
    try {
      localStorage.setItem(SEEN_KEY, JSON.stringify([...seen, ...fresh.map((p) => p.id)].slice(-100)));
    } catch {
      // ignore
    }
    // the very first look after install would announce old ones: only announce what became ready after the app started
    if (started) {
      showToast({
        kind: 'success',
        message: fresh.length === 1 ? `"${fresh[0].recipeTitle}" is ready to check` : `${fresh.length} recipes are ready to check`,
        actionLabel: openReview ? 'Check' : undefined,
        onAction: openReview,
        duration: 15000,
      });
    }
  }
}

export function startReviewWatcher(openReview: () => void): () => void {
  let first = true;
  const tick = async () => {
    await refreshReviewCount(openReview);
    if (first) {
      first = false;
      started = true;
    }
  };
  void tick();
  const timer = window.setInterval(tick, POLL_MS);
  const onFocus = () => void tick();
  window.addEventListener('focus', onFocus);
  return () => {
    window.clearInterval(timer);
    window.removeEventListener('focus', onFocus);
  };
}

export function useReviewCount(): number {
  const [n, setN] = useState(count);
  useEffect(() => {
    listeners.add(setN);
    setN(count);
    return () => {
      listeners.delete(setN);
    };
  }, []);
  return n;
}
