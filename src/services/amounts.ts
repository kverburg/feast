import { findMention } from '../shared/mentions';
import { IngredientItem, StepRef } from '../types/recipe';
import { convertCupToMetric } from './unitConverterService';

// Convert decimal to nice cooking fraction representation
export function formatAmount(amount: number): string {
  if (!amount || amount === 0) return '';

  const whole = Math.floor(amount);
  const remainder = amount - whole;

  let fraction = '';
  if (Math.abs(remainder - 0.25) < 0.05) fraction = '¼';
  else if (Math.abs(remainder - 0.33) < 0.05) fraction = '⅓';
  else if (Math.abs(remainder - 0.5) < 0.05) fraction = '½';
  else if (Math.abs(remainder - 0.66) < 0.05) fraction = '⅔';
  else if (Math.abs(remainder - 0.75) < 0.05) fraction = '¾';

  if (fraction) {
    return whole > 0 ? `${whole} ${fraction}` : fraction;
  }

  // Format clean decimal up to 2 places
  return parseFloat(amount.toFixed(2)).toString();
}

// Pick a readable size for metric amounts: 0.13 l -> 125 ml, 1250 ml -> 1.25 l, 0.35 kg -> 350 g.
// Small numbers keep a little precision, larger ones are rounded to what a measuring cup can show.
export function tidyMetric(amount: number, unit: string): { amount: number; unit: string } {
  const u = unit.toLowerCase().trim();
  let value = amount;
  let target = u;

  if (u === 'l' && value < 1) {
    value *= 1000;
    target = 'ml';
  } else if (u === 'ml' && value >= 1000) {
    value /= 1000;
    target = 'l';
  } else if (u === 'kg' && value < 1) {
    value *= 1000;
    target = 'g';
  } else if (u === 'g' && value >= 1000) {
    value /= 1000;
    target = 'kg';
  } else if (u !== 'ml' && u !== 'g') {
    return { amount, unit };
  }

  if (target === 'ml' || target === 'g') {
    if (value < 10) value = Math.round(value * 2) / 2; // 7.5 g
    else if (value < 100) value = Math.round(value); // 83 ml
    else value = Math.round(value / 5) * 5; // 125 ml, 350 g
    if (value >= 1000) {
      // rounding 999 ml gives 1000 ml: that is 1 l
      value /= 1000;
      target = target === 'ml' ? 'l' : 'kg';
    }
  }
  return { amount: value, unit: target };
}

// Metric <-> Imperial conversion helper using ingredient density; metric results get a readable size
export function convertUnit(
  amount: number,
  unit: string,
  system: 'metric' | 'imperial',
  itemName: string = ''
): { amount: number; unit: string } {
  const converted = convertUnitRaw(amount, unit, system, itemName);
  return system === 'metric' && converted.amount && converted.unit ? tidyMetric(converted.amount, converted.unit) : converted;
}

function convertUnitRaw(
  amount: number,
  unit: string,
  system: 'metric' | 'imperial',
  itemName: string = ''
): { amount: number; unit: string } {
  if (!amount || !unit) return { amount, unit };
  const u = unit.toLowerCase().trim();

  if (system === 'metric') {
    if (['cup', 'cups', 'tbsp', 'tsp', 'oz', 'lbs'].includes(u)) {
      const converted = convertCupToMetric(amount, unit, itemName);
      return { amount: converted.amount, unit: converted.unit };
    }
  } else if (system === 'imperial') {
    if (u === 'g') return { amount: parseFloat((amount * 0.035274).toFixed(1)), unit: 'oz' };
    if (u === 'kg') return { amount: parseFloat((amount * 2.20462).toFixed(1)), unit: 'lbs' };
    if (u === 'ml') return { amount: parseFloat((amount * 0.00422675).toFixed(2)), unit: 'cups' };
    if (u === 'l') return { amount: parseFloat((amount * 4.22675).toFixed(2)), unit: 'cups' };
  }

  return { amount, unit };
}

// ---------------------------------------------------------------------------
// Units that change with the amount ("1 teentje", "2 teentjes") and the language
// ---------------------------------------------------------------------------
interface UnitGroup {
  aliases: string[];
  nl: [string, string]; // singular, plural
  en: [string, string];
  countable?: boolean; // a counting word: the ingredient name after it follows the amount too
}

const UNIT_GROUPS: UnitGroup[] = [
  { aliases: ['teentje', 'teentjes', 'clove', 'cloves'], nl: ['teentje', 'teentjes'], en: ['clove', 'cloves'], countable: true },
  { aliases: ['el', 'eetlepel', 'eetlepels', 'tbsp', 'tablespoon', 'tablespoons'], nl: ['el', 'el'], en: ['tbsp', 'tbsp'] },
  { aliases: ['tl', 'theelepel', 'theelepels', 'tsp', 'teaspoon', 'teaspoons'], nl: ['tl', 'tl'], en: ['tsp', 'tsp'] },
  { aliases: ['stuk', 'stuks', 'piece', 'pieces', 'pcs'], nl: ['stuk', 'stuks'], en: ['piece', 'pieces'], countable: true },
  { aliases: ['takje', 'takjes', 'sprig', 'sprigs'], nl: ['takje', 'takjes'], en: ['sprig', 'sprigs'], countable: true },
  { aliases: ['blaadje', 'blaadjes', 'leaf', 'leaves'], nl: ['blaadje', 'blaadjes'], en: ['leaf', 'leaves'], countable: true },
  { aliases: ['snufje', 'snufjes', 'snuf', 'pinch', 'pinches'], nl: ['snufje', 'snufjes'], en: ['pinch', 'pinches'] },
  { aliases: ['bosje', 'bosjes', 'bunch', 'bunches'], nl: ['bosje', 'bosjes'], en: ['bunch', 'bunches'], countable: true },
  { aliases: ['kopje', 'kopjes', 'cup', 'cups'], nl: ['kopje', 'kopjes'], en: ['cup', 'cups'] },
  { aliases: ['blik', 'blikje', 'blikjes', 'blikken', 'can', 'cans'], nl: ['blik', 'blikken'], en: ['can', 'cans'], countable: true },
  { aliases: ['plak', 'plakje', 'plakjes', 'plakken', 'slice', 'slices'], nl: ['plak', 'plakken'], en: ['slice', 'slices'], countable: true },
  { aliases: ['zakje', 'zakjes', 'packet', 'packets'], nl: ['zakje', 'zakjes'], en: ['packet', 'packets'], countable: true },
];

const findUnitGroup = (unit: string): UnitGroup | undefined => {
  const u = unit.trim().toLowerCase().replace(/\.$/, '');
  return UNIT_GROUPS.find((g) => g.aliases.includes(u));
};

/** The unit word for this amount and language: teentje / teentjes, clove / cloves. Unknown units stay as they are. */
export function formatUnit(unit: string, amount: number, language: 'nl' | 'en'): string {
  if (!unit) return '';
  const group = findUnitGroup(unit);
  if (!group) return unit;
  const forms = group[language];
  return amount > 1 ? forms[1] : forms[0];
}

/** "2 uien" / "1 ui": names follow the amount when it counts items (no unit, or a counting word like stuks). */
export function displayName(item: IngredientItem, amount: number, unit: string): string {
  const group = unit ? findUnitGroup(unit) : undefined;
  const counts = !unit || !!group?.countable;
  if (!counts) return item.name;
  return (amount > 1 ? item.namePlural : item.nameSingular) || item.name;
}

// ---------------------------------------------------------------------------
// Quantities inside step text
// ---------------------------------------------------------------------------
export interface StepSegment {
  text: string;
  ref?: StepRef; // the quantity for this ingredient goes right after `text`
}

/** Split a step into pieces, each ending where an ingredient is mentioned. Refs that do not fit are ignored. */
export function buildStepSegments(text: string, refs: StepRef[] | undefined, knownIds: Set<string>): StepSegment[] {
  const placed: { end: number; ref: StepRef }[] = [];
  const taken: Array<[number, number]> = [];
  for (const ref of refs || []) {
    if (!ref.mention || !knownIds.has(ref.ingredientId)) continue;
    // first occurrence that does not overlap an earlier one
    let from = 0;
    for (;;) {
      const start = findMention(text, ref.mention, from);
      if (start === -1) break;
      const end = start + ref.mention.length;
      if (!taken.some(([a, b]) => start < b && end > a)) {
        taken.push([start, end]);
        placed.push({ end, ref });
        break;
      }
      from = start + 1;
    }
  }
  placed.sort((a, b) => a.end - b.end);

  const segments: StepSegment[] = [];
  let cursor = 0;
  for (const { end, ref } of placed) {
    segments.push({ text: text.slice(cursor, end), ref });
    cursor = end;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor) });
  return segments.length > 0 ? segments : [{ text }];
}
