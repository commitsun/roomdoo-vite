import { fileURLToPath, URL } from 'node:url';
import autoprefixer from 'autoprefixer';

import { defineConfig, Plugin } from 'vite';
import { execSync } from 'child_process';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import vueI18n from '@intlify/unplugin-vue-i18n/vite';
import path from 'path';

const commitHash = execSync('git rev-parse --short HEAD').toString().trim();

function commitHashPlugin(): Plugin {
  const commitHash = execSync('git rev-parse --short HEAD').toString().trim(); // hash corto (7 chars)
  const commitDate = execSync('git log -1 --format=%cd').toString().trim();
  const message = execSync('git log -1 --format=%s').toString().trim();

  return {
    name: 'inject-commit-info',
    transformIndexHtml(html) {
      const comment = `<!-- Build: ${commitDate} | ${message} | ${commitHash} -->\n`;
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
  define: {
    'import.meta.env.VITE_COMMIT_HASH': JSON.stringify(commitHash),
  },
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
          @use "@/ui/assets/variables.scss" as *;
          @use "@/ui/assets/global.scss" as *;
        `,
      },
    },
    postcss: {
      plugins: [autoprefixer()],
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('primevue')) return 'primevue';
            if (id.includes('primeicons')) return 'primeicons';
            if (id.includes('@primeuix/themes') || id.includes('@primevue/themes'))
              return 'primevue-theme';
            if (id.includes('vue')) return 'vue';
            if (id.includes('vue-i18n')) return 'i18n';
            if (id.includes('pinia')) return 'pinia';
            if (id.includes('axios')) return 'vendor';
            if (id.includes('@vueuse/head')) return 'head';
            if (id.includes('quill')) return 'editor';
            if (id.includes('pdfjs')) return 'pdf';
            if (id.includes('fullcalendar')) return 'calendar';
          }
        },
      },
    },
  },
});
