import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Short commit id (set by GitHub Actions), attached to reported errors to tell versions apart
  define: {
    __APP_VERSION__: JSON.stringify((process.env.GITHUB_SHA || 'dev').slice(0, 7)),
  },
});
