// Errors and their classification, shared by the app and the worker.

// Thrown when there is no key to use: none saved in Settings and none configured on the server.
export class GeminiUnavailableError extends Error {}

export class GeminiHttpError extends Error {
  constructor(public status: number, public detail?: string) {
    super(`Gemini API returned status ${status}`);
  }
}

// transient: worth retrying later (rate limit, server hiccup, offline); fatal: retrying will not help
// until something changes (bad key, bad request); unavailable: no key anywhere; other: bad model output.
export type GeminiErrorKind = 'transient' | 'fatal' | 'unavailable' | 'other';

export const classifyGeminiError = (e: unknown): GeminiErrorKind => {
  if (e instanceof GeminiUnavailableError) return 'unavailable';
  if (e instanceof GeminiHttpError) return e.status === 429 || e.status >= 500 ? 'transient' : 'fatal';
  if (e instanceof TypeError) return 'transient'; // fetch failed: offline or blocked
  return 'other';
};

