import path from 'path';

import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import vueI18n from '@intlify/unplugin-vue-i18n/vite';

export default defineConfig({
  plugins: [
    vue(),
    vueI18n({
      include: path.resolve(__dirname, './src/**/locales/**'),
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        additionalData: `
          @use "@/ui/assets/variables.scss" as *;
          @use "@/ui/assets/global.scss" as *;
        `,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    conditions: ['browser', 'import', 'module'],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    css: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reportsDirectory: 'coverage',
      reporter: [
        ['text', { summary: true }],
        ['lcov', { file: 'lcov.info', projectRoot: './' }],
        ['json', { file: 'coverage-final.json' }],
        ['json-summary', { file: 'coverage-summary.json' }],
      ],
      reportOnFailure: true,
      all: true,
      cleanOnRerun: true,
      exclude: ['src/_legacy/**', 'dist/**', '**/*.config.*', 'src/vite-env.d.ts', 'src/App.vue'],
    },
  },
});
