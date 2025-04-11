import { createApp } from 'vue';
import router from './router';
import axiosPlugin from '@/plugins/axios.ts';
import App from './App.vue';
import PrimeVue, { defaultOptions } from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import 'primeicons/primeicons.css';
import { store } from '@/store';

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
  locale: {
    ...defaultOptions.locale,
    firstDayOfWeek: 1,
    dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab'],
    dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
    monthNames: [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ],
    monthNamesShort: [
      'En',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ],
    today: 'Hoy',
  },
});
app.use(router);
app.use(axiosPlugin);
app.use(head);
app.use(store);

app.mount('#app');
