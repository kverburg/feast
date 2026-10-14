// Talks to the worker about background work (translating and annotating recipes), see worker/work.js.
import type { GeminiTranslation, AnnotationResult } from '../shared/geminiTasks';

export interface ServerStatus {
  state: 'idle' | 'working' | 'waiting' | 'stopped';
  note: string;
  nextAt: number;
}

interface PatchBase {
  key: string; // "t|<recipe id>|<hash>" or "a|..."
  id: string; // recipe id
  hash: string; // fingerprint of the recipe when the work was reported
  label: string; // recipe title
  startedAt: number;
  endedAt: number;
  calls?: number;
  gaveUp?: boolean;
  error?: string;
}

export type ServerPatch =
  | (PatchBase & { kind: 't'; method?: string; result?: GeminiTranslation })
  | (PatchBase & { kind: 'a'; method?: string; result?: { main: AnnotationResult; en?: AnnotationResult } });

export interface ServerWork {
  enabled: boolean; // the worker has its own Gemini key, so it can work while the app is closed
  status: ServerStatus | null;
  patches: ServerPatch[];
  pending: number; // how many recipes the worker knows are waiting
  batch?: { active: number; off: string | null }; // Gemini batch jobs in flight; off: why direct calls are used instead
}

/** Ask the worker. Null where there is no worker behind the page (local dev) or you are not logged in. */
export async function fetchServerWork(): Promise<ServerWork | null> {
  try {
    const res = await fetch('/api/work', { cache: 'no-store' });
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) return null;
    return (await res.json()) as ServerWork;
  } catch {
    return null;
  }
}

/** Tell the worker which patches were applied, so it can forget them. */
export async function acknowledgePatches(keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  try {
    await fetch('/api/work/ack', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keys }),
    });
  } catch {
    // the patches stay on the server and are acknowledged next time
  }
}
