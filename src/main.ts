import '@/ui/assets/style.css'; // Legacy styles
import 'primeicons/primeicons.css';
import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import { store as legacyStore } from '@/legacy/store';
import router from '@/ui/router';
import { createHead } from '@vueuse/head';
import { i18n, locale } from '@/ui/plugins/i18n';
import primevuePlugin from '@/ui/primevue/primevue';
import ToastService from 'primevue/toastservice';
import DialogService from 'primevue/dialogservice';

const pinia = createPinia();
createApp(App)
  .use(router)
  .use(pinia)
  .use(legacyStore)
  .use(i18n)
  .use(createHead())
  .use(primevuePlugin, { locale })
  .use(DialogService)
  .use(ToastService)
  .mount('#app');
