// Automatic checks for the benchmark: no model involved, so they are cheap and repeatable.
// Each check is a name plus pass/fail; a recipe's score is the share of checks that passed.
// (A model-judged quality score for translations is the next step, see AI_PROVIDER_BENCHMARK.md.)

const close = (a, b) => Math.abs(Number(a) - Number(b)) < 1e-6;
const share = (list, pred) => (list.length === 0 ? 1 : list.filter(pred).length / list.length);

/** @param item { recipe, lang }  @param run { raw, parsed, error } */
export function checkTranslation({ recipe, lang }, { raw, parsed, error }) {
  const checks = { valid_structure: !error && !!parsed };
  const sections = recipe.ingredientSections || [];
  const steps = recipe.instructions || [];
  const items = sections.flatMap((s) => s.items);
  const outItems = (raw?.ingredientSections || []).flatMap((s) => s.items || []);
  checks.amounts_kept = outItems.length === items.length && items.every((it, i) => close(outItems[i]?.amount, it.amount));
  checks.language_detected = raw?.sourceLanguage === (lang === 'nl' ? 'nl' : 'other');
  const outSteps = raw?.instructions || [];
  checks.steps_translated = share(steps, (s, i) => typeof outSteps[i]?.text === 'string' && outSteps[i].text.trim() && outSteps[i].text.trim() !== s.text.trim()) >= 0.9;
  checks.names_filled = outItems.length > 0 && outItems.every((it) => typeof it?.name === 'string' && it.name.trim());
  return checks;
}

/** @param item { recipe, lang }  @param run { raw, parsed, error } */
export function checkAnnotation({ recipe, lang }, { raw, parsed, error }) {
  const checks = { valid_structure: !error && !!parsed };
  const steps = lang === 'nl' ? recipe.instructions || [] : recipe.instructionsEn || recipe.instructions || [];
  const items = (lang === 'nl' ? recipe.ingredientSections : recipe.ingredientSectionsEn || recipe.ingredientSections || []).flatMap((s) => s.items);
  checks.forms_complete = !!parsed && items.length > 0 && Object.keys(parsed.forms).length / items.length >= 0.9;
  const rawRefs = (raw?.steps || []).flatMap((s, n) => (Array.isArray(s?.refs) ? s.refs.map((r) => ({ r, n })) : []));
  checks.has_refs = !!parsed && parsed.refs.some((r) => r.length > 0);
  checks.mentions_verbatim = rawRefs.length > 0 && share(rawRefs, ({ r, n }) => !!r?.mention && !!steps[n] && steps[n].text.includes(r.mention)) >= 0.9;
  checks.ids_valid = rawRefs.length > 0 && share(rawRefs, ({ r }) => items.some((i) => i.id === r?.id)) >= 0.95;
  return checks;
}

export const scoreOf = (checks) => {
  const values = Object.values(checks);
  return values.length ? values.filter(Boolean).length / values.length : 0;
};

const percentile = (sorted, p) => (sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))] : 0);

/** One summary per run: what the report and the trend are built from. */
export function summarize(results) {
  const n = results.length;
  const names = [...new Set(results.flatMap((r) => Object.keys(r.checks)))];
  const checks = Object.fromEntries(names.map((name) => [name, n ? results.filter((r) => r.checks[name]).length / n : 0]));
  const latencies = results.map((r) => r.ms).sort((a, b) => a - b);
  return {
    recipes: n,
    meanScore: n ? results.reduce((s, r) => s + r.score, 0) / n : 0,
    structureRate: checks.valid_structure ?? 0,
    checks,
    latencyMs: { p50: percentile(latencies, 0.5), p95: percentile(latencies, 0.95) },
    tokens: { input: results.reduce((s, r) => s + (r.tokens?.input || 0), 0), output: results.reduce((s, r) => s + (r.tokens?.output || 0), 0) },
    errors: results.filter((r) => r.error).slice(0, 10).map((r) => ({ recipe: r.name, message: r.error })),
  };
}
