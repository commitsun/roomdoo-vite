import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    include: ['__tests__/**/*.test.ts', 'test/**/*.spec.ts'],
    environment: 'jsdom',
    globals: true,
    css: true,
    setupFiles: ['./__tests__/setup.ts'],
  },
});
