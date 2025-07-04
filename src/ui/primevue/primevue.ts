import { type App } from 'vue';
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primevue/themes';

export const RoomdooPreset = definePreset(Aura, {
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
export default {
  install(app: App, options: any = {}) {
    app.use(PrimeVue, {
      theme: { preset: RoomdooPreset, options: { darkModeSelector: false } },
      locale: options.locale,
    });
  },
};
