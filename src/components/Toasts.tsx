import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { Toast, dismissToast, subscribeToasts } from '../services/toast';

export const Toasts: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  useEffect(() => subscribeToasts(setToasts), []);
  if (toasts.length === 0) return null;

  return (
    <div className="toast-host" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.kind}`} role={t.kind === 'error' ? 'alert' : 'status'}>
          {t.kind === 'success' ? <CheckCircle2 size={18} /> : t.kind === 'error' ? <AlertTriangle size={18} /> : <Info size={18} />}
          <span className="toast-message">{t.message}</span>
          {t.actionLabel && t.onAction && (
            <button
              className="toast-action"
              onClick={() => {
                t.onAction?.();
                dismissToast(t.id);
              }}
            >
              {t.actionLabel}
            </button>
          )}
          <button className="toast-close" onClick={() => dismissToast(t.id)} aria-label="Dismiss">
            <X size={14} />
          </button>
        </div>
      ))}
      <style>{`
        .toast-host {
          position: fixed;
          left: 50%;
          transform: translateX(-50%);
          bottom: 1.25rem;
          z-index: 2000;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          width: min(92vw, 460px);
        }
        @media (max-width: 767px) {
          .toast-host { bottom: 86px; }
        }
        .toast {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.7rem 0.85rem;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-left-width: 4px;
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          color: var(--text-main);
          font-size: 0.9rem;
        }
        .toast-success { border-left-color: #10b981; }
        .toast-success svg:first-child { color: #10b981; }
        .toast-error { border-left-color: #ef4444; }
        .toast-error svg:first-child { color: #ef4444; }
        .toast-info { border-left-color: var(--accent-primary); }
        .toast-info svg:first-child { color: var(--accent-primary); }
        .toast-message { flex: 1; min-width: 0; overflow-wrap: anywhere; }
        .toast-action {
          background: none;
          border: none;
          color: var(--accent-primary);
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
        }
        .toast-close {
          background: none;
          border: none;
          color: var(--text-dim);
          cursor: pointer;
          display: flex;
        }
      `}</style>
    </div>
  );
};
