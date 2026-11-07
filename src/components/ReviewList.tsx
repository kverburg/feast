import React, { useEffect, useState } from 'react';
import { ArrowLeft, Check, ClipboardCheck, Loader2, MessageSquare, RefreshCw, X } from 'lucide-react';
import { Recipe } from '../types/recipe';
import { getStoredRecipes } from '../services/storageService';
import { hasChanges } from '../shared/feedbackTask';
import { ProposalView, approveProposal, commentOnProposal, decideProposal, fetchProposals, recipeChangedSince } from '../services/feedbackService';
import { refreshReviewCount } from '../services/reviewWatcher';

interface Props {
  onBack: () => void;
  onOpenRecipe: (recipe: Recipe) => void;
}

const when = (ms: number) => new Date(ms).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

const itemLine = (i: { amount: number; unit: string; name: string; notes?: string }) =>
  `${i.amount ? `${Math.round(i.amount * 100) / 100} ` : ''}${i.unit ? `${i.unit} ` : ''}${i.name}${i.notes ? ` (${i.notes})` : ''}`;

// Two lists side by side with the lines that are not in the other one marked
const Compare: React.FC<{ label: string; before: string[]; after: string[] }> = ({ label, before, after }) => {
  const b = new Set(before);
  const a = new Set(after);
  return (
    <div className="review-compare">
      <div className="review-compare-label">{label}</div>
      <div className="review-compare-cols">
        <ul>
          {before.map((line, i) => (
            <li key={i} className={a.has(line) ? '' : 'removed'}>{line}</li>
          ))}
        </ul>
        <ul>
          {after.map((line, i) => (
            <li key={i} className={b.has(line) ? '' : 'added'}>{line}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const Card: React.FC<{ p: ProposalView; onChanged: () => void; onOpenRecipe: (r: Recipe) => void }> = ({ p, onChanged, onOpenRecipe }) => {
  const [commenting, setCommenting] = useState(false);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const recipe = getStoredRecipes().find((r) => r.id === p.recipeId);
  const fields = p.proposal?.fields;

  const run = async (job: () => Promise<string | null | boolean>) => {
    setBusy(true);
    setError('');
    const result = await job();
    if (typeof result === 'string') setError(result);
    else if (result === false) setError('That did not work. Try again.');
    else {
      setCommenting(false);
      setComment('');
    }
    await refreshReviewCount();
    onChanged();
    setBusy(false);
  };

  const approve = () =>
    run(async () => {
      if (recipeChangedSince(p) && !confirm('This recipe was edited after you sent the feedback. Approving replaces its ingredients and steps with the proposal. Continue?')) return true;
      return approveProposal(p);
    });

  return (
    <div className={`review-card card ${p.status}`}>
      <div className="review-head">
        <button type="button" className="review-title" disabled={!recipe} onClick={() => recipe && onOpenRecipe(recipe)} title={recipe ? 'Open this recipe' : undefined}>
          {p.recipeTitle}
        </button>
        <span className={`review-status ${p.status}`}>
          {p.status === 'working' ? 'being made…' : p.status === 'ready' ? 'ready to check' : p.status === 'failed' ? 'failed' : p.status === 'approved' ? 'approved' : 'declined'}
        </span>
      </div>

      <p className="review-feedback">“{p.feedback}”</p>
      {p.comments.map((c, i) => (
        <p key={i} className="review-feedback comment">+ {c.text}</p>
      ))}

      {p.status === 'working' && (
        <p className="review-working"><Loader2 size={14} className="spin" /> The AI is working on it. You get a notification when it is ready.</p>
      )}

      {p.status === 'failed' && <p className="review-error">{p.error || 'The AI could not make a proposal.'}</p>}

      {(p.status === 'ready' || p.status === 'approved' || p.status === 'declined') && p.proposal && (
        <div className="review-proposal">
          <p className="review-summary">{p.proposal.summary}</p>
          {p.proposal.changes.length > 0 && (
            <ul className="review-changes">
              {p.proposal.changes.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          )}
          {!hasChanges(p.proposal) && <p className="review-nochange">No change to the recipe is proposed.</p>}
          {recipe && fields?.ingredientSections && (
            <Compare label="Ingredients: now / proposed" before={recipe.ingredientSections.flatMap((s) => s.items.map(itemLine))} after={fields.ingredientSections.flatMap((s) => s.items.map(itemLine))} />
          )}
          {recipe && fields?.instructions && (
            <Compare label="Steps: now / proposed" before={recipe.instructions.map((s) => s.text)} after={fields.instructions.map((s) => s.text)} />
          )}
          {fields && (fields.title || fields.description || fields.servings !== undefined || fields.prepTime !== undefined || fields.cookTime !== undefined) && (
            <p className="review-misc">
              Also changes:{' '}
              {[fields.title && `title "${fields.title}"`, fields.description && 'description', fields.servings !== undefined && `servings ${fields.servings}`, fields.prepTime !== undefined && `prep time ${fields.prepTime} min`, fields.cookTime !== undefined && `cook time ${fields.cookTime} min`].filter(Boolean).join(', ')}
            </p>
          )}
          {p.status === 'ready' && recipe && recipeChangedSince(p) && (
            <p className="review-warn">This recipe was edited after you sent the feedback.</p>
          )}
        </div>
      )}

      {p.status === 'ready' && (
        <div className="review-actions">
          {p.proposal && hasChanges(p.proposal) && (
            <button className="btn btn-primary btn-sm" disabled={busy} onClick={approve}>
              <Check size={16} /><span>Approve</span>
            </button>
          )}
          <button className="btn btn-secondary btn-sm" disabled={busy} onClick={() => run(() => decideProposal(p.id, 'decline'))}>
            <X size={16} /><span>{p.proposal && hasChanges(p.proposal) ? 'Decline' : 'OK, no change'}</span>
          </button>
          <button className="btn btn-outline btn-sm" disabled={busy} onClick={() => setCommenting(!commenting)}>
            <MessageSquare size={16} /><span>Add comment</span>
          </button>
        </div>
      )}
      {p.status === 'failed' && (
        <div className="review-actions">
          <button className="btn btn-secondary btn-sm" disabled={busy} onClick={() => setCommenting(true)}>
            <RefreshCw size={16} /><span>Try again with a comment</span>
          </button>
          <button className="btn btn-outline btn-sm" disabled={busy} onClick={() => run(() => decideProposal(p.id, 'decline'))}>
            <X size={16} /><span>Dismiss</span>
          </button>
        </div>
      )}

      {commenting && (
        <form
          className="review-comment"
          onSubmit={(e) => {
            e.preventDefault();
            if (comment.trim()) void run(() => commentOnProposal(p.id, comment.trim()));
          }}
        >
          <textarea className="textarea-field" autoFocus placeholder="What should be different? The AI starts again with your remark." value={comment} onChange={(e) => setComment(e.target.value)} />
          <button type="submit" className="btn btn-primary btn-sm" disabled={busy || !comment.trim()}>Send</button>
        </form>
      )}
      {error && <p className="review-error">{error}</p>}
      <div className="review-time">{when(p.createdAt)}</div>
    </div>
  );
};

export const ReviewList: React.FC<Props> = ({ onBack, onOpenRecipe }) => {
  const [list, setList] = useState<ProposalView[] | null>(null);
  const [unavailable, setUnavailable] = useState(false);

  const load = async () => {
    const result = await fetchProposals();
    if (!result) setUnavailable(true);
    else {
      setUnavailable(false);
      setList(result);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  // while something is being made, look again every few seconds
  const working = !!list?.some((p) => p.status === 'working');
  useEffect(() => {
    if (!working) return;
    const id = window.setInterval(load, 6000);
    return () => window.clearInterval(id);
  }, [working]);

  const open = (list || []).filter((p) => ['ready', 'working', 'failed'].includes(p.status));
  const order = { ready: 0, failed: 1, working: 2 } as Record<string, number>;
  open.sort((a, b) => order[a.status] - order[b.status] || b.updatedAt - a.updatedAt);
  const done = (list || []).filter((p) => ['approved', 'declined'].includes(p.status));

  return (
    <div className="review-page">
      <div className="review-page-head">
        <button className="btn btn-secondary btn-sm" onClick={onBack}>
          <ArrowLeft size={16} /><span>Back</span>
        </button>
        <h2><ClipboardCheck size={20} /> Recipes to check</h2>
      </div>
      <p className="setting-desc">
        Feedback you sent from a recipe. The AI proposes a change; nothing in the recipe changes until you approve it. Comment to let the AI try again.
      </p>
      {unavailable && <p className="setting-desc">The server is needed for this (not available in local development).</p>}
      {list && open.length === 0 && !unavailable && <p className="setting-desc">Nothing to check. Use the Feedback button on a recipe.</p>}
      {open.map((p) => <Card key={p.id} p={p} onChanged={load} onOpenRecipe={onOpenRecipe} />)}

      {done.length > 0 && (
        <details className="review-done">
          <summary>Earlier ({done.length})</summary>
          {done.map((p) => <Card key={p.id} p={p} onChanged={load} onOpenRecipe={onOpenRecipe} />)}
        </details>
      )}

      <style>{`
        .review-page { display: flex; flex-direction: column; gap: 1rem; }
        .review-page-head { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
        .review-page-head h2 { display: flex; align-items: center; gap: 0.4rem; margin: 0; font-size: 1.2rem; }
        .review-card { padding: 1rem; display: flex; flex-direction: column; gap: 0.6rem; }
        .review-card.approved, .review-card.declined { opacity: 0.75; }
        .review-head { display: flex; align-items: baseline; justify-content: space-between; gap: 0.75rem; flex-wrap: wrap; }
        .review-title { background: none; border: none; padding: 0; text-align: left; font: inherit; font-weight: 800; font-size: 1.05rem; color: var(--text-main); cursor: pointer; }
        .review-title:disabled { cursor: default; }
        .review-title:hover:not(:disabled) { color: var(--accent-primary); text-decoration: underline; }
        .review-status { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; color: var(--text-muted); }
        .review-status.ready { color: var(--accent-primary); }
        .review-status.failed { color: #ef4444; }
        .review-feedback { margin: 0; font-style: italic; color: var(--text-muted); }
        .review-feedback.comment { font-style: normal; }
        .review-working { display: flex; align-items: center; gap: 0.4rem; margin: 0; color: var(--text-muted); font-size: 0.9rem; }
        .spin { animation: review-spin 1s linear infinite; }
        @keyframes review-spin { to { transform: rotate(360deg); } }
        .review-proposal { display: flex; flex-direction: column; gap: 0.5rem; padding: 0.75rem; background: var(--bg-input); border-radius: var(--radius-sm); }
        .review-summary { margin: 0; font-weight: 600; }
        .review-changes { margin: 0; padding-left: 1.1rem; }
        .review-nochange, .review-misc { margin: 0; color: var(--text-muted); font-size: 0.9rem; }
        .review-warn { margin: 0; color: #b45309; font-size: 0.85rem; font-weight: 600; }
        .review-error { margin: 0; color: #ef4444; font-size: 0.9rem; }
        .review-compare-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-dim); margin-bottom: 0.25rem; }
        .review-compare-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        .review-compare ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.2rem; font-size: 0.85rem; }
        .review-compare li { padding: 0.15rem 0.35rem; border-radius: 4px; }
        .review-compare li.removed { background: rgba(239, 68, 68, 0.14); text-decoration: line-through; }
        .review-compare li.added { background: rgba(34, 197, 94, 0.18); }
        .review-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .review-comment { display: flex; flex-direction: column; gap: 0.5rem; align-items: flex-start; }
        .review-comment textarea { width: 100%; min-height: 70px; }
        .review-time { font-size: 0.75rem; color: var(--text-dim); }
        .review-done summary { cursor: pointer; color: var(--text-muted); margin-bottom: 0.75rem; }
        .review-done .review-card { margin-bottom: 0.75rem; }
        @media (max-width: 600px) { .review-compare-cols { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
};
