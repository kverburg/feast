// Push notifications: the app registers a service worker and subscribes this device; the worker sends the messages.

export type PushState =
  | 'unsupported' // no service worker / push in this browser (on iPhone: Feast must be added to the Home Screen first)
  | 'denied' // notifications are blocked in the browser settings
  | 'off' // possible, not turned on
  | 'on';

const supported = (): boolean => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

/** Register the service worker (it only handles push). Safe to call at start-up. */
export async function registerServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  try {
    await navigator.serviceWorker.register('/sw.js');
  } catch {
    // no worker: no notifications, nothing else changes
  }
}

const urlBase64ToBytes = (text: string): Uint8Array<ArrayBuffer> => {
  const pad = '='.repeat((4 - (text.length % 4)) % 4);
  const bin = atob((text + pad).replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
};

export async function getPushState(): Promise<PushState> {
  if (!supported()) return 'unsupported';
  if (Notification.permission === 'denied') return 'denied';
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = await reg?.pushManager.getSubscription();
    return sub && Notification.permission === 'granted' ? 'on' : 'off';
  } catch {
    return 'off';
  }
}

const deviceLabel = (): string => {
  const ua = navigator.userAgent;
  const os = /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iPhone/iPad' : /Mac/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows' : 'Device';
  const browser = /Edg\//.test(ua) ? 'Edge' : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : 'Browser';
  return `${os} ${browser}`;
};

/** Ask permission, subscribe this device and hand the subscription to the server. Throws with a readable reason. */
export async function enablePush(): Promise<void> {
  if (!supported()) throw new Error('This browser cannot show push notifications. On an iPhone, add Feast to the Home Screen first.');
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Notifications are blocked. Allow them for this site in the browser settings.');

  const reg = (await navigator.serviceWorker.getRegistration()) || (await navigator.serviceWorker.register('/sw.js'));
  await navigator.serviceWorker.ready;
  const keyRes = await fetch('/api/push/key', { cache: 'no-store' });
  if (!keyRes.ok || !keyRes.headers.get('content-type')?.includes('application/json')) {
    throw new Error('The server does not support notifications here (local development has no server).');
  }
  const { publicKey } = await keyRes.json();

  const existing = await reg.pushManager.getSubscription();
  const subscription = existing || (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToBytes(publicKey) }));
  const res = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subscription: subscription.toJSON(), label: deviceLabel() }),
  });
  if (!res.ok) throw new Error('The server did not accept this device.');
}

export async function disablePush(): Promise<void> {
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  if (!sub) return;
  try {
    await fetch('/api/push/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: sub.endpoint }),
    });
  } catch {
    // the server drops it when the push service reports it gone
  }
  await sub.unsubscribe();
}

/** A test message to all devices. Returns how many were reached. */
export async function sendTestPush(): Promise<{ sent: number; failed: number }> {
  const res = await fetch('/api/push/test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  if (!res.ok) throw new Error('The test message could not be sent.');
  return res.json();
}
