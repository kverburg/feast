import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ErrorBannerProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  onDismiss?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, actionLabel, onAction, secondaryLabel, onSecondary, onDismiss }) => (
  <div className="error-banner" role="alert">
    <AlertTriangle size={18} />
    <span className="error-banner-text">{message}</span>
    {actionLabel && onAction && (
      <button className="btn btn-secondary btn-sm" onClick={onAction}>
        {actionLabel}
      </button>
    )}
    {secondaryLabel && onSecondary && (
      <button className="btn btn-secondary btn-sm" onClick={onSecondary}>
        {secondaryLabel}
      </button>
    )}
    {onDismiss && (
      <button className="btn btn-outline btn-icon" onClick={onDismiss} aria-label="Dismiss" title="Dismiss">
        <X size={14} />
      </button>
    )}
    <style>{`
      .error-banner {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1.5rem;
        background: rgba(239, 68, 68, 0.12);
        border-bottom: 1px solid rgba(239, 68, 68, 0.4);
        color: #ef4444;
        font-size: 0.9rem;
        flex-wrap: wrap;
      }
      .error-banner-text {
        flex: 1;
        color: var(--text-main);
      }
      @media (max-width: 600px) {
        .error-banner { padding: 0.75rem 1rem; gap: 0.5rem; }
        .error-banner-text { flex: 1 1 calc(100% - 40px); min-width: 0; }
      }
    `}</style>
  </div>
);
