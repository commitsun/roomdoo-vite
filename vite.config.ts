import { fileURLToPath, URL } from 'node:url';
import autoprefixer from 'autoprefixer';
import { visualizer } from 'rollup-plugin-visualizer';

import { defineConfig, Plugin, loadEnv } from 'vite';
import { execSync } from 'child_process';
import vue from '@vitejs/plugin-vue';
import vueI18n from '@intlify/unplugin-vue-i18n/vite';
import tailwindcss from '@tailwindcss/vite';
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

// manualChunks - keep per-package split, but skip known tiny libs
const TINY_LIB_DENYLIST = ['@unhead/ssr', 'birpc', 'packrup', 'perfect-debounce'];

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'ROOMDOO_');

  return {
    plugins: [
      vue(),
      visualizer({ filename: 'dist/stats.html', gzipSize: true }),
      tailwindcss(),
      vueI18n({
        include: path.resolve(__dirname, './src/**/locales/**'),
      }),
      commitHashPlugin(),
    ],
    define: {
      'import.meta.env.ROOMDOO_COMMIT_HASH': JSON.stringify(commitHash),
      __VUE_OPTIONS_API__: true, //  some libraries still need this
      __VUE_PROD_DEVTOOLS__: false,
    },

    resolve: {
      alias: {
        vue: 'vue/dist/vue.runtime.esm-bundler.js',
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      proxy: {
        '/api': {
          target: env.ROOMDOO_API_URL,
          changeOrigin: true,
          secure: false,
          cookieDomainRewrite: 'localhost',
        },
        '/pmsApi': {
          target: env.ROOMDOO_API_URL,
          changeOrigin: true,
          secure: false,

          cookieDomainRewrite: 'localhost',
        },
      },
      hmr: {
        protocol: 'ws',
        host: '127.0.0.1',
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
    optimizeDeps: { include: ['quill'] },
    envPrefix: 'ROOMDOO_',
    build: {
      chunkSizeWarningLimit: 400,
      sourcemap: false,
      minify: 'esbuild',
      target: 'es2020',
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return;

            // Normalize path separators just in case (prevents regex misses on Windows-like paths)
            const pathId = id.replace(/\\/g, '/');

            // --- PrimeVue per-component, but NEVER split 'config' (it treeshakes to 0) ---
            // e.g. node_modules/primevue/dialog/...  -> pv-dialog
            //      node_modules/primevue/config/...  -> (no dedicated chunk)
            const pvFirst = pathId.match(/node_modules\/primevue\/([^/]+)/);
            if (pvFirst) {
              if (pvFirst[1] === 'config') return undefined; // avoid "pv-config" empty chunk
              return `pv-${pvFirst[1]}`;
            }

            // --- Keep explicit buckets ---
            if (pathId.includes('@primeuix/themes') || pathId.includes('@primevue/themes'))
              return 'primevue-theme';
            if (pathId.includes('/@primeuix/styles')) return 'primeuix-styles';
            if (pathId.includes('/@primeuix/styled')) return 'primeuix-styled';
            if (pathId.includes('/@primeuix/utils')) return 'primeuix-utils';

            // --- Core framework buckets (order matters) ---
            if (pathId.includes('/vue-router/')) return 'vue-router';
            if (pathId.includes('/vue/')) return 'vue';
            if (pathId.includes('pinia')) return 'pinia';
            if (pathId.includes('vue-i18n')) return 'i18n';

            // --- Common large libraries ---
            if (pathId.includes('/axios/')) return 'axios';
            if (pathId.includes('/chart.js/')) return 'chartjs';
            if (pathId.includes('/quill/')) return 'quill';

            // --- Route devtools/vueuse into 'vue' so they don't get empty named chunks ---
            const pkgMatch = pathId.match(/node_modules\/(@?[^/]+(?:\/[^/]+)?)\//);
            const pkg = pkgMatch?.[1] ?? '';
            if (/^@vue\/devtools/.test(pkg)) return 'vue';
            if (/^@vueuse\//.test(pkg)) return 'vue';

            // --- Prevent a named empty chunk for 'zod' (often fully treeshaken) ---
            if (pathId.includes('/zod/')) return undefined; // let Rollup merge/discard

            // --- tiny-lib denylist ---
            if (TINY_LIB_DENYLIST.some((name) => pathId.includes(`/node_modules/${name}/`))) {
              return undefined;
            }

            // --- Default: per top-level package name (current fallback) ---
            if (pkg) return pkg;
            return 'vendor-slim';
          },

          // avoid extremely small chunks
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]',
        },
      },
    },
  };
});
