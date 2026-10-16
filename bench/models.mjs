// Lists the models your keys can use (the choices for --model).  npm run bench:models
import fs from 'node:fs';

if (fs.existsSync('.env.local')) {
  for (const line of fs.readFileSync('.env.local', 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
  }
}

if (process.env.MISTRAL_API_KEY) {
  const res = await fetch('https://api.mistral.ai/v1/models', { headers: { Authorization: `Bearer ${process.env.MISTRAL_API_KEY}` } });
  console.log(`\nMistral (HTTP ${res.status}) - use with --provider mistral --model <id>`);
  if (res.ok) {
    const { data } = await res.json();
    for (const m of data.filter((m) => m.capabilities?.completion_chat !== false).sort((a, b) => a.id.localeCompare(b.id))) {
      console.log(`  ${m.id}${m.capabilities?.vision ? '  (vision)' : ''}${m.deprecation ? '  (deprecated)' : ''}`);
    }
  }
} else console.log('\nMistral: no MISTRAL_API_KEY');

if (process.env.GEMINI_API_KEY) {
  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=200', { headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY } });
  console.log(`\nGemini (HTTP ${res.status}) - use with --provider gemini --model <id>`);
  if (res.ok) {
    const { models } = await res.json();
    for (const m of models.filter((m) => (m.supportedGenerationMethods || []).includes('generateContent')).sort((a, b) => a.name.localeCompare(b.name))) {
      console.log(`  ${m.name.replace('models/', '')}`);
    }
  }
} else console.log('\nGemini: no GEMINI_API_KEY');
