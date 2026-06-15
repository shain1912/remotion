import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Factory Studio frontend. Secrets stay in the backend (factory/server.mjs); the browser
// only sees NODE_ENV — never the MiniMax keys.
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': JSON.stringify({ NODE_ENV: 'development' }),
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': 'http://localhost:3030',
      '/out': 'http://localhost:3030',
      '/pub': 'http://localhost:3030',
    },
  },
});
