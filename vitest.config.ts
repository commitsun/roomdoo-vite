import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import vueI18n from '@intlify/unplugin-vue-i18n/vite';
import path from 'path';

export default defineConfig({
  plugins: [
    vue(),
    vueI18n({
      include: path.resolve(__dirname, './src/**/locales/**'),
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    css: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    // You can also filter test files here if you prefer patterns:
    // include: ['src/**/*.test.ts', 'src/**/*.spec.ts']
  },
});
