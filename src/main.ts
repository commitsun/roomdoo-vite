import '@/ui/assets/style.css';
import 'primeicons/primeicons.css';
import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import { store as legacyStore } from '@/_legacy/store';
import router from '@/infrastructure/plugins/router';
import { createHead } from '@vueuse/head';
import { i18n } from '@/infrastructure/plugins/i18n';
import primevuePlugin from '@/infrastructure/plugins/primevue';
import ToastService from 'primevue/toastservice';
import DialogService from 'primevue/dialogservice';

const pinia = createPinia();
createApp(App)
  .use(router)
  .use(pinia)
  .use(legacyStore)
  .use(i18n)
  .use(createHead())
  .use(primevuePlugin)
  .use(DialogService)
  .use(ToastService)
  .mount('#app');
