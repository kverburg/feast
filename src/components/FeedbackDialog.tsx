import React, { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { Recipe } from '../types/recipe';
import { sendFeedback } from '../services/feedbackService';
import { showToast } from '../services/toast';

interface Props {
  recipe: Recipe;
  onClose: () => void;
  onOpenReview: () => void;
}

export const FeedbackDialog: React.FC<Props> = ({ recipe, onClose, onOpenReview }) => {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy(true);
    setError('');
    if (await sendFeedback(recipe, text.trim())) {
      showToast({
        kind: 'success',
        message: 'Feedback sent. You get a notification when the proposal is ready to check.',
        actionLabel: 'Recipes to check',
        onAction: onOpenReview,
      });
      onClose();
    } else {
      setError('The feedback could not be sent. This needs the server (it does not work in local development).');
      setBusy(false);
    }
  };

  return (
    <div className="fb-overlay" onClick={onClose}>
      <form className="fb-dialog card" onClick={(e) => e.stopPropagation()} onSubmit={submit} role="dialog" aria-modal="true" aria-label="Feedback">
        <div className="fb-head">
          <h3><MessageSquare size={18} /> Feedback on this recipe</h3>
          <button type="button" className="btn btn-secondary btn-icon" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>
        <p className="fb-hint">
          Say what was wrong or could be better ("too salty", "bake it at 200 °C", "needs more garlic"). The AI proposes a change, and you check it before anything is updated.
        </p>
        <textarea className="textarea-field" autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder="Your feedback…" />
        {error && <p className="fb-error">{error}</p>}
        <div className="fb-actions">
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary btn-sm" disabled={busy || !text.trim()}>{busy ? 'Sending…' : 'Send feedback'}</button>
        </div>
      </form>
      <style>{`
        .fb-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 1rem; }
        .fb-dialog { width: 100%; max-width: 460px; padding: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem; background: var(--bg-primary); }
        .fb-head { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }
        .fb-head h3 { display: flex; align-items: center; gap: 0.4rem; margin: 0; font-size: 1.05rem; }
        .fb-hint { margin: 0; color: var(--text-muted); font-size: 0.9rem; }
        .fb-dialog textarea { min-height: 110px; width: 100%; }
        .fb-error { margin: 0; color: #ef4444; font-size: 0.9rem; }
        .fb-actions { display: flex; justify-content: flex-end; gap: 0.5rem; }
      `}</style>
    </div>
  );
};
