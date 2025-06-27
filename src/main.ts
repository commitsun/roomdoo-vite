// — Styles
import '@/ui/assets/style.css';
import 'primeicons/primeicons.css';

// — Vue core
import { createApp } from 'vue';
import App from './App.vue';

// — State management
import { createPinia } from 'pinia';
import { store as vuexStore } from '@/legacy/store';

// — Routing
import router from '@/ui/router';

// — Head management
import { createHead } from '@vueuse/head';

// — Plugins
import axiosPlugin from '@/plugins/axios';
import { i18n, locale } from '@/plugins/i18n';
import primevuePlugin from '@/plugins/primevue';

// — Create app
const app = createApp(App);

app
  // 1. state
  .use(createPinia())
  .use(vuexStore)

  // 2. internationalization
  .use(i18n)

  // 3. routing
  .use(router)

  // 4. meta tags
  .use(createHead())

  // 5. http client
  .use(axiosPlugin)

  // 6. UI framework
  .use(primevuePlugin, { locale }) // <— así instalas PrimeVue con tu preset y locale

  // 7. mount
  .mount('#app');
