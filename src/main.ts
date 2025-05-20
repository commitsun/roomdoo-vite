import { createApp } from 'vue';
import router from './router';
import axiosPlugin from '@/plugins/axios';
import App from './App.vue';
import PrimeVue, { defaultOptions } from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import 'primeicons/primeicons.css';
import { store } from '@/legacy/store';
import { i18n } from '@/plugins/i18n';
import { locale } from '@/plugins/locale';


import '@/assets/style.css';
import { createHead } from '@vueuse/head';
import { definePreset } from '@primevue/themes';

const myPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#e3f3fc',
      100: '#bde3f8',
      200: '#8dd1f3',
      300: '#5cbced',
      400: '#33ace7',
      500: '#1e9ed9',
      600: '#1a89c0',
      700: '#156e99',
      800: '#115377',
      900: '#0c3752',
      950: '#08212f',
    },
  },
});
const head = createHead();
const app = createApp(App);
app.use(PrimeVue, {
  theme: {
    preset: myPreset,
    options: {
      darkModeSelector: false || 'none',
    },
  },
  locale,
});
app.use(router);
app.use(axiosPlugin);
app.use(head);
app.use(store);
app.use(i18n);

app.mount('#app');
export const appLocale = locale;

