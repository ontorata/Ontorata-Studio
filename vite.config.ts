import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const rataryTarget = env.VITE_RATARY_PROXY_TARGET || 'http://localhost:9876';
  const ontoryTarget = env.VITE_ONTORY_PROXY_TARGET || 'http://localhost:9787';
  const authTarget = env.VITE_AUTH_PROXY_TARGET || env.VITE_AUTH_BASE_URL || 'http://localhost:8780';

  return {
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
        '/ontory': {
          target: ontoryTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/ontory/, ''),
        },
        '/auth-proxy': {
          target: authTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/auth-proxy/, ''),
        },
      },
    },
    test: {
      environment: 'node',
      include: ['tests/**/*.test.ts'],
    },
  };
});
