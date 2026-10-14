import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { geminiProxy } from './worker/gemini.js';

// Local development: serve /api/gemini/* from the dev server with the key from .env.local
// (GEMINI_API_KEY=...), the same proxy the worker runs in production. The key stays in this
// process and is never bundled, because it has no VITE_ prefix.
function geminiDevProxy(env: Record<string, string>): Plugin {
  return {
    name: 'gemini-dev-proxy',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url || '', 'http://localhost');
        if (!url.pathname.startsWith('/api/gemini/')) return next();

        let bodyText = '';
        if (req.method === 'POST') {
          for await (const chunk of req) bodyText += chunk;
        }
        const result = await geminiProxy({
          route: url.pathname.slice('/api/gemini/'.length),
          method: req.method || 'GET',
          tier: url.searchParams.get('tier'),
          bodyText,
          env,
          log: (level, fields) => {
            if (level !== 'info') console.warn('[gemini]', fields);
          },
        });
        res.statusCode = result.status;
        res.setHeader('Content-Type', result.status === 404 ? 'text/plain' : 'application/json');
        res.end(result.body);
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), geminiDevProxy(env)],
    // Short commit id (set by GitHub Actions), attached to reported errors to tell versions apart
    define: {
      __APP_VERSION__: JSON.stringify((process.env.GITHUB_SHA || 'dev').slice(0, 7)),
    },
  };
});
