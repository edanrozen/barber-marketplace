import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves a project repo's Pages site under /<repo-name>/, so
// the production build needs that as its base — but local dev should stay
// at '/' (nothing about `npm run dev` changes). `command === 'build'` is
// exactly the branch GitHub Actions runs for the Pages deploy.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/barber-marketplace/' : '/',
  build: {
    // The repo root already has its own `assets/` directory (shared static
    // assets for the barber-marketplace app) — this build's output also
    // gets copied to the repo root for the GitHub Pages fallback path, so
    // its own assets folder must not collide with that unrelated one.
    assetsDir: 'bp-assets',
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true,
    port: 5173,
  },
}));
