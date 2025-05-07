import { fileURLToPath, URL } from 'node:url';
import autoprefixer from 'autoprefixer';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8014',
        changeOrigin: true,
        secure: false,
      },
    },
    hmr: {
      protocol: 'ws',
      host: '127.0.0.1', // o tu IP local si accedes desde otra máquina
      port: 3000,
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        additionalData: `
          @use "@/assets/variables.scss" as *;
          @use "@/assets/global.scss" as *;
        `,
      },
    },
    postcss: {
      plugins: [autoprefixer()],
    },
  },
});
