import vue from '@vitejs/plugin-vue';
import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/admin/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@workshop/shared': path.resolve(
        __dirname,
        '../../packages/shared/src/index.ts'
      ),
    },
  },
  server: {
    port: 5174,
  },
});
