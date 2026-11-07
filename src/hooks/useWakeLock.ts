import { useEffect } from 'react';

// Keeps the screen from going to sleep while `active` is true (a recipe is open and you are cooking).
// The browser drops the lock whenever the page is hidden, so it is asked for again when the page comes back.
// Without the Wake Lock API (older browsers) nothing happens.
export function useWakeLock(active: boolean): void {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return;
    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;

    const request = async () => {
      try {
        const lock = await navigator.wakeLock.request('screen');
        if (cancelled) {
          void lock.release();
          return;
        }
        sentinel = lock;
        lock.addEventListener('release', () => {
          if (sentinel === lock) sentinel = null;
        });
      } catch {
        // refused (battery saver, page not visible): nothing to do
      }
    };

    const onVisible = () => {
      if (document.visibilityState === 'visible' && !sentinel) void request();
    };

    void request();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
      void sentinel?.release();
      sentinel = null;
    };
  }, [active]);
}
