import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  envDir: path.resolve(__dirname, '../config'),
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@ionic') || id.includes('ionicons')) {
              return 'vendor-ionic';
            }
            if (id.includes('react') || id.includes('react-router')) {
              return 'vendor-react';
            }
            return 'vendor';
          }
        }
      }
    }
  }
});
