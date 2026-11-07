// Web Push from the worker, with WebCrypto only (no libraries): VAPID (RFC 8292) to identify the app to the push
// service, and aes128gcm payload encryption (RFC 8291) so only the subscribed browser can read the message.
//
// The VAPID key pair is made on first use and kept in KV (key push:vapid). It must never change afterwards:
// browsers tie a subscription to the public key they subscribed with.
// Subscriptions live in KV key push:subs. All of it sits behind Cloudflare Access like the rest of the data.

const enc = new TextEncoder();

export const b64url = (bytes) => {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = '';
  for (const b of arr) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

export const fromB64url = (text) => {
  const pad = '='.repeat((4 - (text.length % 4)) % 4);
  const bin = atob(text.replace(/-/g, '+').replace(/_/g, '/') + pad);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
};

const concat = (...parts) => {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
};

// ---- keys and subscriptions ----------------------------------------------------------------------------------

/** { publicKey: base64url of the 65-byte uncompressed point, privateJwk } (created once). */
export async function getVapid(env) {
  const stored = await env.FEAST.get('push:vapid');
  if (stored) return JSON.parse(stored);
  const pair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  const publicKey = b64url(await crypto.subtle.exportKey('raw', pair.publicKey));
  const privateJwk = await crypto.subtle.exportKey('jwk', pair.privateKey);
  const vapid = { publicKey, privateJwk };
  await env.FEAST.put('push:vapid', JSON.stringify(vapid));
  return vapid;
}

export async function readSubscriptions(env) {
  try {
    const raw = await env.FEAST.get('push:subs');
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

const MAX_SUBSCRIPTIONS = 20;
const validEndpoint = (e) => typeof e === 'string' && /^https:\/\/[^\s]{10,500}$/.test(e);

export async function addSubscription(env, sub, label = '') {
  const endpoint = sub && sub.endpoint;
  const p256dh = sub && sub.keys && sub.keys.p256dh;
  const auth = sub && sub.keys && sub.keys.auth;
  if (!validEndpoint(endpoint) || typeof p256dh !== 'string' || typeof auth !== 'string') return false;
  const list = (await readSubscriptions(env)).filter((s) => s.endpoint !== endpoint);
  list.unshift({ endpoint, keys: { p256dh, auth }, label: String(label).slice(0, 80), createdAt: Date.now() });
  await env.FEAST.put('push:subs', JSON.stringify(list.slice(0, MAX_SUBSCRIPTIONS)));
  return true;
}

export async function removeSubscription(env, endpoint) {
  const list = await readSubscriptions(env);
  const next = list.filter((s) => s.endpoint !== endpoint);
  if (next.length !== list.length) await env.FEAST.put('push:subs', JSON.stringify(next));
  return list.length - next.length;
}

// ---- VAPID ---------------------------------------------------------------------------------------------------

async function vapidHeader(env, endpoint, subject) {
  const { publicKey, privateJwk } = await getVapid(env);
  const key = await crypto.subtle.importKey('jwk', privateJwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const header = b64url(enc.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const payload = b64url(
    enc.encode(JSON.stringify({ aud: new URL(endpoint).origin, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: subject }))
  );
  const signature = new Uint8Array(await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, enc.encode(`${header}.${payload}`)));
  return `vapid t=${header}.${payload}.${b64url(signature)}, k=${publicKey}`;
}

// ---- payload encryption (aes128gcm, RFC 8291) ----------------------------------------------------------------

const hkdf = async (salt, ikm, info, bytes) => {
  const key = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info }, key, bytes * 8));
};

/** The request body for one subscription: salt, record size, sender key and the encrypted message. */
export async function encryptPayload(subscription, plaintext) {
  const uaPublic = fromB64url(subscription.keys.p256dh); // 65 bytes
  const authSecret = fromB64url(subscription.keys.auth); // 16 bytes
  const ephemeral = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const asPublic = new Uint8Array(await crypto.subtle.exportKey('raw', ephemeral.publicKey));
  const uaKey = await crypto.subtle.importKey('raw', uaPublic, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const ecdh = new Uint8Array(await crypto.subtle.deriveBits({ name: 'ECDH', public: uaKey }, ephemeral.privateKey, 256));

  const ikm = await hkdf(authSecret, ecdh, concat(enc.encode('WebPush: info\0'), uaPublic, asPublic), 32);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(salt, ikm, enc.encode('Content-Encoding: aes128gcm\0'), 16);
  const nonce = await hkdf(salt, ikm, enc.encode('Content-Encoding: nonce\0'), 12);

  const record = concat(plaintext, new Uint8Array([2])); // 0x02: last (and only) record
  const aes = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt']);
  const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, aes, record));

  const recordSize = new Uint8Array([0, 0, 0x10, 0]); // 4096
  return concat(salt, recordSize, new Uint8Array([asPublic.length]), asPublic, cipher);
}

// ---- sending -------------------------------------------------------------------------------------------------

/**
 * Send a notification to every subscribed device: { title, body, url, tag }.
 * Subscriptions the push service reports as gone (404/410) are removed.
 * Returns { sent, failed, removed }.
 */
export async function sendPush(env, message, { subject, log = () => {} } = {}) {
  subject = subject || (await env.FEAST.get('push:subject')) || 'https://feast.invalid';
  const subs = await readSubscriptions(env);
  const body = enc.encode(JSON.stringify(message));
  const result = { sent: 0, failed: 0, removed: 0 };
  await Promise.all(
    subs.map(async (sub) => {
      try {
        const headers = {
          Authorization: await vapidHeader(env, sub.endpoint, subject),
          'Content-Encoding': 'aes128gcm',
          'Content-Type': 'application/octet-stream',
          TTL: '86400',
          Urgency: 'normal',
        };
        // a newer message with the same topic replaces one that has not been delivered yet
        const topic = message.tag ? String(message.tag).replace(/[^A-Za-z0-9_-]/g, '').slice(0, 32) : '';
        if (topic) headers.Topic = topic;
        const res = await fetch(sub.endpoint, { method: 'POST', headers, body: await encryptPayload(sub, body) });
        if (res.ok) result.sent += 1;
        else if (res.status === 404 || res.status === 410) {
          await removeSubscription(env, sub.endpoint);
          result.removed += 1;
        } else {
          result.failed += 1;
          log('warn', { event: 'push_failed', status: res.status });
        }
      } catch (e) {
        result.failed += 1;
        log('warn', { event: 'push_error', reason: e instanceof Error ? e.message : String(e) });
      }
    })
  );
  return result;
}
