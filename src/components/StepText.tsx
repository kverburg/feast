import React, { useState } from 'react';
import { IngredientItem, InstructionStep } from '../types/recipe';
import { buildStepSegments, convertUnit, formatAmount, formatUnit } from '../services/amounts';
import { CookingEntry, cookingTimeForStep } from '../services/cookingTimes';
import { CookingTimePopup } from './CookingTimePopup';

interface StepTextProps {
  step: InstructionStep;
  items: IngredientItem[]; // all ingredients of the version being shown
  scaleRatio: number; // portions now / portions in the recipe
  unitSystem: 'metric' | 'imperial';
  language: 'nl' | 'en';
  className?: string; // default styling comes from the recipe page; cook mode styles its own paragraph
}

// A step's text with the amount of each ingredient right after where it is mentioned,
// e.g. "Voeg de uien (2) en de bouillon (500 ml) toe". Amounts follow the portions.
export const StepText: React.FC<StepTextProps> = ({ step, items, scaleRatio, unitSystem, language, className = 'step-text' }) => {
  const [openEntry, setOpenEntry] = useState<CookingEntry | null>(null);
  const byId = new Map(items.map((i) => [i.id, i]));
  const segments = buildStepSegments(step.text, step.refs, new Set(byId.keys()));

  return (
    <>
    <p className={className || undefined}>
      {segments.map((seg, i) => {
        const item = seg.ref ? byId.get(seg.ref.ingredientId) : undefined;
        let quantity = '';
        if (item && seg.ref && item.amount) {
          const scaled = item.amount * (seg.ref.fraction && seg.ref.fraction > 0 ? seg.ref.fraction : 1) * scaleRatio;
          const converted = convertUnit(scaled, item.unit, unitSystem, item.name);
          const unit = formatUnit(converted.unit, converted.amount, language);
          quantity = `${formatAmount(converted.amount)}${unit ? ` ${unit}` : ''}`.trim();
        }
        // An ingredient we know cooking times for becomes tappable: it opens the times
        const entry = item
          ? cookingTimeForStep(item.nameSingular || item.name, step.text) || cookingTimeForStep(item.name, step.text)
          : undefined;
        const mention = seg.ref?.mention || '';
        const before = entry && mention ? seg.text.slice(0, seg.text.length - mention.length) : seg.text;
        return (
          <React.Fragment key={i}>
            {before}
            {entry && mention && (
              <button type="button" className="step-mention" aria-haspopup="dialog" onClick={() => setOpenEntry(entry)}>
                {mention}
              </button>
            )}
            {quantity && <span className="step-qty">{` (${quantity})`}</span>}
          </React.Fragment>
        );
      })}
    </p>
    {openEntry && <CookingTimePopup entry={openEntry} language={language} onClose={() => setOpenEntry(null)} />}
    </>
  );
};
