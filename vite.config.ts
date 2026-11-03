import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
    return {
      server: {
        port: 3000,
        host: 'localhost',
      },
      plugins: [react()],
      build: {
        // The WebGL engine (Three.js) is a single lazy chunk by design.
        chunkSizeWarningLimit: 650,
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
