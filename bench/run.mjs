// Benchmark runner. Usage (see AI_PROVIDER_BENCHMARK.md):
//   npm run bench -- --task translate --provider mistral --model mistral-small-latest --context bench/contexts/v1.md --label v1
// Runs a task over the golden set with the chosen provider/model, scores it with automatic checks and stores
// the run: in Cloudflare KV when CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID are set, always also in .bench-results/.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import { generateContent } from '../worker/gemini.js';
import { buildTranslationRequest, parseTranslation, buildAnnotationRequest, parseAnnotation, readJson } from '../src/shared/geminiTasks.ts';
import { INITIAL_RECIPES } from '../src/services/storageService.ts';
import { kvClient } from './kv.mjs';
import { checkTranslation, checkAnnotation, scoreOf, summarize } from './checks.mjs';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith('--') ? [...acc, [a.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : 'true']] : acc), [])
);

// .env.local holds the keys for local runs; real environment variables win
if (fs.existsSync('.env.local')) {
  for (const line of fs.readFileSync('.env.local', 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
  }
}

const task = args.task || 'translate';
const provider = args.provider || 'gemini';
const gap = Number(args.gap ?? 1100); // Mistral's free tier allows about 1 request per second
const limit = args.limit ? Number(args.limit) : Infinity;
if (!['translate', 'annotate'].includes(task)) throw new Error('--task must be translate or annotate');
if (!['gemini', 'mistral'].includes(provider)) throw new Error('--provider must be gemini or mistral');

const env = {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  MISTRAL_API_KEY: process.env.MISTRAL_API_KEY,
  AI_PROVIDER: provider,
  AI_PROVIDER_LIGHT: provider,
  MISTRAL_BASE: process.env.MISTRAL_BASE, // overrides, used by tests with a stand-in server
  GEMINI_BASE: process.env.GEMINI_BASE,
};
const model = args.model || (provider === 'mistral' ? 'mistral-small-latest' : 'gemini-flash-latest');
if (provider === 'mistral') env.MISTRAL_MODEL = env.MISTRAL_MODEL_LIGHT = model;
else env.GEMINI_MODEL = env.GEMINI_MODEL_LIGHT = model;
if (!(provider === 'mistral' ? env.MISTRAL_API_KEY : env.GEMINI_API_KEY)) throw new Error(`No ${provider} key: set it in .env.local or the environment`);

// Optional context (instructions, glossary, examples) added as the system instruction: a "prompt version" to compare
const contextText = args.context ? fs.readFileSync(args.context, 'utf8').trim() : '';
const contextHash = contextText ? crypto.createHash('sha256').update(contextText).digest('hex').slice(0, 8) : 'none';
const label = args.label || (args.context ? path.basename(args.context, path.extname(args.context)) : 'baseline');
const withContext = (body) => (contextText ? { ...body, systemInstruction: { parts: [{ text: contextText }] } } : body);

// Golden set: the seed recipes plus your own recipes (bench/golden/*.json, or Cloudflare KV key bench:golden),
// each in both directions when it has two languages. See bench/golden.mjs: your recipes are never committed.
const strip = (r) => ({ ...r, titleEn: undefined, descriptionEn: undefined, ingredientSectionsEn: undefined, instructionsEn: undefined, translationPending: false });
const expand = (r, prefix) => {
  if (r.ingredientSectionsEn && r.instructionsEn) {
    return [
      { name: `${prefix}${r.title} (nl)`, lang: 'nl', recipe: strip(r) },
      { name: `${prefix}${r.title} (en)`, lang: 'en', recipe: { ...strip(r), title: r.titleEn || r.title, description: r.descriptionEn || r.description, ingredientSections: r.ingredientSectionsEn, instructions: r.instructionsEn }, full: r },
    ];
  }
  return [{ name: `${prefix}${r.title}`, lang: 'en', recipe: r }]; // only one language: assume English (to be translated to Dutch)
};
const golden = INITIAL_RECIPES.flatMap((r) => expand(r, `${r.id} `));
let own = [];
const goldenDir = 'bench/golden';
if (fs.existsSync(goldenDir)) {
  for (const f of fs.readdirSync(goldenDir).filter((f) => f.endsWith('.json'))) {
    const data = JSON.parse(fs.readFileSync(path.join(goldenDir, f), 'utf8'));
    own.push(...(Array.isArray(data) ? data : data.recipes || []));
  }
}
if (own.length === 0 && kvClient()) own = (await kvClient().get('bench:golden')) || [];
golden.push(...own.filter((r) => !String(r.id).startsWith('seed-')).flatMap((r) => expand(r, 'app: ')));
console.log(`golden set: ${golden.length} cases (${INITIAL_RECIPES.length} seed recipes, ${own.length} of your own)`);
const cases = golden.slice(0, limit);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
console.log(`${task} on ${provider}/${model}, context ${label} (${contextHash}), ${cases.length} recipes`);
for (const c of cases) {
  const started = Date.now();
  let tokens;
  const generate = async (body, tier) => {
    const out = await generateContent(env, withContext(body), tier);
    const u = out?.usageMetadata;
    if (u) tokens = { input: u.promptTokenCount || 0, output: u.candidatesTokenCount || 0 };
    return out;
  };
  const run = { raw: undefined, parsed: undefined, error: undefined };
  try {
    const sections = c.lang === 'en' && c.full ? c.full.ingredientSectionsEn : c.recipe.ingredientSections;
    const steps = c.lang === 'en' && c.full ? c.full.instructionsEn : c.recipe.instructions;
    if (task === 'translate') {
      run.raw = readJson(await generate(buildTranslationRequest(c.recipe), 'default'));
      run.parsed = parseTranslation(c.recipe, run.raw);
    } else {
      run.raw = readJson(await generate(buildAnnotationRequest(sections, steps, c.lang), 'light'));
      run.parsed = parseAnnotation(sections, steps, run.raw);
    }
  } catch (e) {
    run.error = e instanceof Error ? e.message : String(e);
  }
  const checks = (task === 'translate' ? checkTranslation : checkAnnotation)({ recipe: c.full || c.recipe, lang: c.lang }, run);
  const entry = { name: c.name, checks, score: scoreOf(checks), ms: Date.now() - started, tokens, error: run.error };
  results.push(entry);
  console.log(`${entry.score.toFixed(2)}  ${entry.ms}ms  ${c.name}${run.error ? `  ERROR ${run.error.slice(0, 120)}` : ''}`);
  await sleep(gap);
}

let commit = '';
try { commit = execSync('git rev-parse --short HEAD').toString().trim(); } catch { /* not a git checkout */ }
const startedAt = new Date().toISOString();
const run = {
  id: `${startedAt.replace(/[-:.TZ]/g, '').slice(0, 14)}-${task}-${provider}-${label}`.replace(/[^a-zA-Z0-9_-]/g, '_'),
  startedAt, task, provider, model, label, contextHash, commit,
  ...summarize(results),
  items: results.map((r) => ({ name: r.name, score: r.score, ms: r.ms, error: r.error })),
};
console.log(`\nmean score ${run.meanScore.toFixed(3)}, structure ${(run.structureRate * 100).toFixed(0)}%, p50 ${run.latencyMs.p50}ms`);
console.log(Object.entries(run.checks).map(([k, v]) => `  ${k}: ${(v * 100).toFixed(0)}%`).join('\n'));

fs.mkdirSync('.bench-results', { recursive: true });
fs.writeFileSync(`.bench-results/${run.id}.json`, JSON.stringify(run, null, 2));
console.log(`saved .bench-results/${run.id}.json`);

// Upload to Cloudflare KV (the app's Settings > Benchmark page reads it there)
const kv = kvClient();
if (kv && args.upload !== 'false') {
  const { items, ...summary } = run;
  const index = (await kv.get('bench:index')) || [];
  await kv.put(`bench:run:${run.id}`, run);
  await kv.put('bench:index', [summary, ...index.filter((r) => r.id !== run.id)].slice(0, 200));
  console.log('uploaded to Cloudflare KV');
} else {
  console.log('not uploaded (set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID to store it in Cloudflare)');
}
