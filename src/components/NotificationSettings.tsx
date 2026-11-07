import React, { useEffect, useState } from 'react';
import { Bell, BellOff, Send } from 'lucide-react';
import { PushState, disablePush, enablePush, getPushState, sendTestPush } from '../services/pushService';

const HINT: Record<PushState, string> = {
  unsupported: 'This browser cannot show push notifications. On an iPhone or iPad, add Feast to the Home Screen first (Share, then Add to Home Screen) and open it from there.',
  denied: 'Notifications are blocked for this site. Allow them in the browser or phone settings, then come back.',
  off: 'Get a message on this device when something needs you, for example a recipe that is ready to check.',
  on: 'This device gets notifications, also when the app is closed.',
};

export const NotificationSettings: React.FC = () => {
  const [state, setState] = useState<PushState | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const refresh = () => getPushState().then(setState);
  useEffect(() => {
    void refresh();
  }, []);

  const run = async (job: () => Promise<string | void>) => {
    setBusy(true);
    setMessage('');
    try {
      const done = await job();
      if (done) setMessage(done);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : String(e));
    }
    await refresh();
    setBusy(false);
  };

  return (
    <div className="settings-card card">
      <div className="setting-row">
        <div>
          <span className="setting-name">Notifications</span>
          <p className="setting-desc">{state ? HINT[state] : 'Checking…'}</p>
          {message && <p className="setting-desc notif-message">{message}</p>}
        </div>
        <div className="notif-actions">
          {state === 'off' && (
            <button className="btn btn-secondary btn-sm" disabled={busy} onClick={() => run(enablePush)}>
              <Bell size={16} />
              <span>Turn on</span>
            </button>
          )}
          {state === 'on' && (
            <>
              <button
                className="btn btn-secondary btn-sm"
                disabled={busy}
                onClick={() => run(async () => {
                  const r = await sendTestPush();
                  return r.sent > 0 ? `Sent to ${r.sent} device${r.sent === 1 ? '' : 's'}.` : 'No device could be reached. Try turning notifications off and on again.';
                })}
              >
                <Send size={16} />
                <span>Send a test</span>
              </button>
              <button className="btn btn-outline btn-sm" disabled={busy} onClick={() => run(disablePush)}>
                <BellOff size={16} />
                <span>Turn off</span>
              </button>
            </>
          )}
        </div>
      </div>
      <style>{`
        .notif-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; justify-content: flex-end; }
        .notif-message { color: var(--accent-primary); }
      `}</style>
    </div>
  );
};
