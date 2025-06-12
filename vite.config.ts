import { fileURLToPath, URL } from 'node:url';
import autoprefixer from 'autoprefixer';

import { defineConfig, Plugin } from 'vite';
import { execSync } from 'child_process';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import vueI18n from '@intlify/unplugin-vue-i18n/vite';
import path from 'path';

function commitHashPlugin(): Plugin {
  const commitHash = execSync('git rev-parse HEAD').toString().trim();
  const commitDate = execSync('git log -1 --format=%cd').toString().trim();

  return {
    name: 'inject-commit-hash',
    transformIndexHtml(html) {
      const comment = `<!-- Build commit: ${commitHash} | Date: ${commitDate} -->\n`;
      return comment + html;
    },
  };
}

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    vueI18n({
      include: path.resolve(__dirname, './src/locales/**'),
    }),
    commitHashPlugin(),
  ],
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
        target: 'http://localhost:8016',
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
