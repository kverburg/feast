import test from 'node:test';
import assert from 'node:assert/strict';
import { b64url, fromB64url, encryptPayload, getVapid, addSubscription, readSubscriptions, removeSubscription, sendPush } from '../worker/push.js';

const fakeKv = () => {
  const store = new Map();
  return { store, async get(k) { return store.get(k) ?? null; }, async put(k, v) { store.set(k, v); } };
};

// A browser: its own key pair and auth secret, and the matching decryption (RFC 8291, receiver side)
async function makeBrowser() {
  const pair = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const publicRaw = new Uint8Array(await crypto.subtle.exportKey('raw', pair.publicKey));
  const auth = crypto.getRandomValues(new Uint8Array(16));
  const subscription = (endpoint = 'https://push.example.test/send/abc123') => ({ endpoint, keys: { p256dh: b64url(publicRaw), auth: b64url(auth) } });
  const enc = new TextEncoder();
  const hkdf = async (salt, ikm, info, bytes) => new Uint8Array(await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info }, await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']), bytes * 8));
  const cat = (...p) => { const o = new Uint8Array(p.reduce((n, x) => n + x.length, 0)); let i = 0; for (const x of p) { o.set(x, i); i += x.length; } return o; };
  const decrypt = async (body) => {
    const salt = body.slice(0, 16);
    const idlen = body[20];
    const asPublic = body.slice(21, 21 + idlen);
    const cipher = body.slice(21 + idlen);
    const asKey = await crypto.subtle.importKey('raw', asPublic, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
    const ecdh = new Uint8Array(await crypto.subtle.deriveBits({ name: 'ECDH', public: asKey }, pair.privateKey, 256));
    const ikm = await hkdf(auth, ecdh, cat(enc.encode('WebPush: info\0'), publicRaw, asPublic), 32);
    const cek = await hkdf(salt, ikm, enc.encode('Content-Encoding: aes128gcm\0'), 16);
    const nonce = await hkdf(salt, ikm, enc.encode('Content-Encoding: nonce\0'), 12);
    const plain = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: nonce }, await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['decrypt']), cipher));
    let end = plain.length;
    while (end > 0 && plain[end - 1] === 0) end--;
    assert.equal(plain[end - 1], 2); // the delimiter of the last record
    return new TextDecoder().decode(plain.slice(0, end - 1));
  };
  return { subscription, decrypt, body: { rs: 4096 } };
}

test('base64url round trips', () => {
  const bytes = new Uint8Array([0, 251, 252, 253, 254, 255, 1, 2, 3]);
  assert.deepEqual(fromB64url(b64url(bytes)), bytes);
});

test('the browser can decrypt what the worker encrypts', async () => {
  const browser = await makeBrowser();
  const message = JSON.stringify({ title: 'Feast', body: 'Een recept staat klaar', url: '/#/settings/review' });
  const body = await encryptPayload(browser.subscription(), new TextEncoder().encode(message));
  assert.equal(body[16], 0); assert.equal(body[17], 0); assert.equal(body[18], 0x10); assert.equal(body[19], 0); // record size 4096
  assert.equal(body[20], 65);
  assert.equal(await browser.decrypt(body), message);
});

test('the VAPID key pair is made once and kept', async () => {
  const env = { FEAST: fakeKv() };
  const first = await getVapid(env);
  const second = await getVapid(env);
  assert.equal(first.publicKey, second.publicKey);
  assert.equal(fromB64url(first.publicKey).length, 65);
});

test('subscriptions: add, replace, validate, remove', async () => {
  const env = { FEAST: fakeKv() };
  const b = await makeBrowser();
  assert.equal(await addSubscription(env, b.subscription(), 'Android Chrome'), true);
  assert.equal(await addSubscription(env, b.subscription(), 'Android Chrome'), true); // same endpoint: replaced
  assert.equal((await readSubscriptions(env)).length, 1);
  assert.equal(await addSubscription(env, { endpoint: 'http://insecure.test/x', keys: { p256dh: 'a', auth: 'b' } }), false);
  assert.equal(await addSubscription(env, { endpoint: 'https://push.example.test/zzzzzz' }), false);
  assert.equal(await removeSubscription(env, 'https://push.example.test/send/abc123'), 1);
  assert.equal((await readSubscriptions(env)).length, 0);
});

test('sending: signed with VAPID, encrypted, and dead subscriptions are removed', async () => {
  const env = { FEAST: fakeKv() };
  const alive = await makeBrowser();
  const dead = await makeBrowser();
  await addSubscription(env, alive.subscription('https://push.example.test/send/alive-1111'));
  await addSubscription(env, dead.subscription('https://push.example.test/send/dead-2222'));
  const seen = [];
  globalThis.fetch = async (url, init) => {
    seen.push({ url: String(url), init });
    return new Response('', { status: String(url).includes('dead') ? 410 : 201 });
  };
  const result = await sendPush(env, { title: 'Hi', body: 'There', url: '/', tag: 'recipe-1' }, { subject: 'https://feast.example.test' });
  assert.deepEqual(result, { sent: 1, failed: 0, removed: 1 });
  assert.equal((await readSubscriptions(env)).length, 1);

  const call = seen.find((s) => s.url.includes('alive'));
  const h = call.init.headers;
  assert.equal(h['Content-Encoding'], 'aes128gcm');
  assert.equal(h.Topic, 'recipe-1');
  assert.match(h.Authorization, /^vapid t=[\w-]+\.[\w-]+\.[\w-]+, k=[\w-]{87}$/);
  assert.equal(JSON.parse(await alive.decrypt(call.init.body)).title, 'Hi');

  // the JWT verifies with the public key and names the push service
  const [, jwt, k] = h.Authorization.match(/t=([^,]+), k=(.+)$/);
  const [head, payload, sig] = jwt.split('.');
  const claims = JSON.parse(new TextDecoder().decode(fromB64url(payload)));
  assert.equal(claims.aud, 'https://push.example.test');
  assert.equal(claims.sub, 'https://feast.example.test');
  assert.ok(claims.exp > Date.now() / 1000);
  const pub = await crypto.subtle.importKey('raw', fromB64url(k), { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
  assert.equal(await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, pub, fromB64url(sig), new TextEncoder().encode(`${head}.${payload}`)), true);
});
