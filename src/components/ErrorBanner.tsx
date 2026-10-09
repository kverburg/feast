import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorBannerProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, actionLabel, onAction }) => (
  <div className="error-banner" role="alert">
    <AlertTriangle size={18} />
    <span className="error-banner-text">{message}</span>
    {actionLabel && onAction && (
      <button className="btn btn-secondary btn-sm" onClick={onAction}>
        {actionLabel}
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
      }
      .error-banner-text {
        flex: 1;
        color: var(--text-main);
      }
    `}</style>
  </div>
);
