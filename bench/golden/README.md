# Golden recipes

The benchmark always uses the three seed recipes, in both directions (Dutch to English, English to Dutch).

Your own recipes are added with `npm run bench:golden` (see `bench/golden.mjs`): export a backup from Settings, then

    npm run bench:golden -- backup.json --exclude "text in a title to leave out"

This repo is public, so your recipes are never committed: `bench/golden/*.json` is git-ignored, and the
scheduled benchmark reads them from Cloudflare KV (`bench:golden`) instead. A recipe with a second language
is run in both directions; one without is treated as English and translated to Dutch.
