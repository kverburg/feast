import React from 'react';
import { IngredientItem, InstructionStep } from '../types/recipe';
import { buildStepSegments, convertUnit, formatAmount, formatUnit } from '../services/amounts';

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
  const byId = new Map(items.map((i) => [i.id, i]));
  const segments = buildStepSegments(step.text, step.refs, new Set(byId.keys()));

  return (
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
        return (
          <React.Fragment key={i}>
            {seg.text}
            {quantity && <span className="step-qty">{` (${quantity})`}</span>}
          </React.Fragment>
        );
      })}
    </p>
  );
};
