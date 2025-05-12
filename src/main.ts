import { createApp } from 'vue';
import router from './router';
import axiosPlugin from '@/plugins/axios.ts';
import App from './App.vue';
import PrimeVue, { defaultOptions } from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import 'primeicons/primeicons.css';
import { store } from '@/legacy/store';

import { en_GB } from 'primelocale/js/en_GB.js';
import { en } from 'primelocale/js/en.js';
import { es } from 'primelocale/js/es.js';

import '@/assets/style.css';
import { createHead } from '@vueuse/head';
import { definePreset } from '@primevue/themes';

const langAndArea = window.navigator.language.split('-');
let locale;
if (langAndArea.length > 1) {
  const country = langAndArea[1].toUpperCase();
  if (country === 'GB') {
    locale = en_GB;
  } else {
    locale = langAndArea[0] === 'es' ? es : en;
  }
} else {
  if (langAndArea[0] === 'es') {
    locale = es;
  } else {
    locale = en;
  }
}

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

app.mount('#app');
