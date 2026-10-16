// Cloudflare KV over the REST API, for the benchmark (results and the private golden set).
// Needs CLOUDFLARE_API_TOKEN (Workers KV Storage: Edit) and CLOUDFLARE_ACCOUNT_ID; returns null without them.
import fs from 'node:fs';

export function kvClient() {
  const { CLOUDFLARE_API_TOKEN: token, CLOUDFLARE_ACCOUNT_ID: account } = process.env;
  if (!token || !account) return null;
  const toml = fs.readFileSync('wrangler.toml', 'utf8');
  const ns = (toml.match(/binding\s*=\s*"FEAST"\s*\nid\s*=\s*"([0-9a-f]+)"/) || [])[1];
  const base = `https://api.cloudflare.com/client/v4/accounts/${account}/storage/kv/namespaces/${ns}/values/`;
  const headers = { Authorization: `Bearer ${token}` };
  return {
    async get(key) {
      const res = await fetch(base + encodeURIComponent(key), { headers });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`KV read ${key}: HTTP ${res.status}`);
      return res.json();
    },
    async put(key, value) {
      const res = await fetch(base + encodeURIComponent(key), { method: 'PUT', headers, body: JSON.stringify(value) });
      if (!res.ok) throw new Error(`KV write ${key}: HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
    },
  };
}
