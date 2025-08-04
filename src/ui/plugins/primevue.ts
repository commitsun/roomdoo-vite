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

let primevueApp: App | null = null;

export function getPrimeVueApp(): App | null {
  return primevueApp;
}

function getPrimeVueLocale(newLocale: string) {
  if (newLocale === 'es') {
    return require('primelocale/js/es.js').es;
  }
  return require('primelocale/js/en.js').en;
}

export function updatePrimevueLocale(newLocale: string) {
  const app = getPrimeVueApp();
  const primevueLocale = getPrimeVueLocale(newLocale);
  if (app?.config.globalProperties.$primevue?.config?.locale) {
    Object.assign(app.config.globalProperties.$primevue.config.locale, primevueLocale);
  }
}

export default {
  install(app: App, options: any = {}) {
    primevueApp = app;

    app.use(PrimeVue, {
      theme: { preset: RoomdooPreset, options: { darkModeSelector: false } },
      locale: options.locale || {},
    });
  },
};
