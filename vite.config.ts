import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const rataryTarget = process.env.VITE_RATARY_PROXY_TARGET ?? 'http://localhost:9876';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8765,
    proxy: {
      '/api': {
        target: rataryTarget,
        changeOrigin: true,
      },
      '/health': {
        target: rataryTarget,
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
