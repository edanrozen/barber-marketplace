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
