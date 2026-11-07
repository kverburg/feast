import type { Recipe } from '../types/recipe';
import { ProposalContent, applyProposal, baseHash, baseOf } from '../shared/feedbackTask';
import { getStoredRecipes, saveStoredRecipes } from './storageService';
import { notifyRecipesChanged, startTranslationQueue } from './translationService';

export interface ProposalView {
  id: string;
  recipeId: string;
  recipeTitle: string;
  baseHash: string;
  feedback: string;
  comments: { text: string; at: number }[];
  status: 'working' | 'ready' | 'failed' | 'approved' | 'declined';
  proposal?: ProposalContent;
  error?: string;
  createdAt: number;
  updatedAt: number;
}

const postJson = async (url: string, body: unknown): Promise<boolean> => {
  try {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return res.ok;
  } catch {
    return false;
  }
};

/** The feedback proposals, or null where there is no server (local development) or no login. */
export async function fetchProposals(): Promise<ProposalView[] | null> {
  try {
    const res = await fetch('/api/feedback', { cache: 'no-store' });
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) return null;
    return (await res.json()) as ProposalView[];
  } catch {
    return null;
  }
}

/** Send feedback on a recipe: the AI makes a proposal in the background. False when the server refused or is absent. */
export const sendFeedback = (recipe: Recipe, feedback: string): Promise<boolean> =>
  postJson('/api/feedback', { recipeId: recipe.id, recipeTitle: recipe.title, base: baseOf(recipe), hash: baseHash(recipe), feedback });

export const commentOnProposal = (id: string, comment: string): Promise<boolean> => postJson('/api/feedback/comment', { id, comment });

export const decideProposal = (id: string, decision: 'approve' | 'decline'): Promise<boolean> => postJson('/api/feedback/decide', { id, decision });

/** Has the recipe been edited since the proposal was made? */
export function recipeChangedSince(p: ProposalView): boolean {
  const recipe = getStoredRecipes().find((r) => r.id === p.recipeId);
  return !!recipe && baseHash(recipe) !== p.baseHash;
}

/** Put an approved proposal into the recipe and record the decision. Returns an error message, or null when done. */
export async function approveProposal(p: ProposalView): Promise<string | null> {
  if (!p.proposal) return 'There is no proposal to approve.';
  const all = getStoredRecipes();
  const recipe = all.find((r) => r.id === p.recipeId);
  if (!recipe) return 'This recipe no longer exists.';
  saveStoredRecipes(all.map((r) => (r.id === recipe.id ? applyProposal(recipe, p.proposal!) : r)));
  notifyRecipesChanged();
  startTranslationQueue(); // the new text is translated and annotated again
  return (await decideProposal(p.id, 'approve')) ? null : 'The recipe is updated, but the server did not record the decision.';
}
