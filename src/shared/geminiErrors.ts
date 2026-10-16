// Errors and their classification, shared by the app and the worker.

// Thrown when there is no key to use: none saved in Settings and none configured on the server.
export class GeminiUnavailableError extends Error {}

export class GeminiHttpError extends Error {
  constructor(public status: number, public detail?: string) {
    super(`Gemini API returned status ${status}${detail ? `: ${summarizeDetail(detail)}` : ''}`);
  }
}

// Gemini answers errors as {"error":{"message":...}}: keep just the message
const summarizeDetail = (detail: string): string => {
  try {
    const message = JSON.parse(detail)?.error?.message;
    if (typeof message === 'string') return message.slice(0, 200);
  } catch {
    // not JSON
  }
  return detail.slice(0, 200);
};

// A rejected key: 401/403, or the 400 Gemini sends for an invalid key. Any other 400 is about the request itself.
export const isKeyProblem = (e: unknown): boolean =>
  e instanceof GeminiHttpError &&
  (e.status === 401 || e.status === 403 || (e.status === 400 && /api[ _-]?key/i.test(e.detail || '')));

// transient: worth retrying later (rate limit, server hiccup, offline); fatal: retrying will not help
// until something changes (bad key, unknown model); unavailable: no key anywhere; other: bad model output or a request Gemini refuses (tried a few times, then given up on).
export type GeminiErrorKind = 'transient' | 'fatal' | 'unavailable' | 'other';

export const classifyGeminiError = (e: unknown): GeminiErrorKind => {
  if (e instanceof GeminiUnavailableError) return 'unavailable';
  if (e instanceof GeminiHttpError) {
    if (e.status === 429 || e.status >= 500) return 'transient';
    // A request Gemini refuses (400, ...) is that recipe's problem, not the key's: it must not stop the queue
    return isKeyProblem(e) || e.status === 404 ? 'fatal' : 'other';
  }
  if (e instanceof TypeError) return 'transient'; // fetch failed: offline or blocked
  return 'other';
};

