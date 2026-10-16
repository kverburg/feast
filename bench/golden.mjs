// Prepares the golden recipes from an app backup. The repo is public and these are your recipes,
// so they are never committed: they go to bench/golden/app.json (git-ignored) and to Cloudflare KV
// (key bench:golden, private), where the scheduled benchmark picks them up.
//
//   npm run bench:golden -- backup.json --exclude "- ~44 ~Aar 1" [--exclude "other text"] [--dry]
//
// --exclude drops recipes whose title (either language) contains the text, ignoring case.
import fs from 'node:fs';
import { kvClient } from './kv.mjs';

const argv = process.argv.slice(2);
const file = argv.find((a) => !a.startsWith('--') && argv[argv.indexOf(a) - 1] !== '--exclude');
const excludes = argv.flatMap((a, i) => (a === '--exclude' && argv[i + 1] ? [argv[i + 1].toLowerCase()] : []));
if (!file) throw new Error('Usage: npm run bench:golden -- <backup.json> [--exclude "text"]... [--dry]');

const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const all = (Array.isArray(data) ? data : data.recipes || []).filter((r) => r && r.id && !String(r.id).startsWith('seed-'));
const titles = (r) => [r.title, r.titleEn].filter(Boolean).map((t) => String(t).toLowerCase());
const excluded = all.filter((r) => titles(r).some((t) => excludes.some((x) => t.includes(x))));
const kept = all.filter((r) => !excluded.includes(r));

console.log(`${all.length} recipes in the backup (seed recipes skipped)`);
console.log(`excluded ${excluded.length}:`);
for (const r of excluded) console.log(`  - ${r.title}`);
console.log(`kept ${kept.length}:`);
for (const r of kept) console.log(`  + ${r.title}${r.titleEn ? '' : '  (no second language)'}`);
if (argv.includes('--dry')) process.exit(0);

// Only what the tasks read; images and other fields stay out
const slim = kept.map((r) => ({
  id: r.id, title: r.title, description: r.description, titleEn: r.titleEn, descriptionEn: r.descriptionEn,
  ingredientSections: r.ingredientSections, instructions: r.instructions,
  ingredientSectionsEn: r.ingredientSectionsEn, instructionsEn: r.instructionsEn,
}));
fs.mkdirSync('bench/golden', { recursive: true });
fs.writeFileSync('bench/golden/app.json', JSON.stringify(slim));
console.log('saved bench/golden/app.json (git-ignored)');

const kv = kvClient();
if (kv) {
  await kv.put('bench:golden', slim);
  console.log('uploaded to Cloudflare KV (bench:golden)');
} else {
  console.log('not uploaded: set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID so the scheduled run can use them');
}
