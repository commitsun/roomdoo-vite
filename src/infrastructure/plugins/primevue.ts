import { type App, h } from 'vue';
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primevue/themes';
import { en_GB } from 'primelocale/js/en_GB.js';
import { en } from 'primelocale/js/en.js';
import { es } from 'primelocale/js/es.js';

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

const getLocale = (localeCode: string) => {
  let baseLang = localeCode.split('-')[0];
  const area = localeCode.split('-')[1]?.toUpperCase();
  if (baseLang === 'es' || baseLang === 'gl' || baseLang === 'ca' || baseLang === 'eu') {
    return es;
  } else if (area === 'GB') {
    return en_GB;
  }
  return en;
};

export function updatePrimevueLocale(newLocale: string) {
  const primevueLocale = getLocale(newLocale);
  if (primevueApp?.config.globalProperties.$primevue?.config?.locale) {
    Object.assign(primevueApp.config.globalProperties.$primevue.config.locale, primevueLocale);
  }
}
export default {
  install(app: App) {
    primevueApp = app;
    app.use(PrimeVue, {
      theme: { preset: RoomdooPreset, options: { darkModeSelector: false } },
      locale: getLocale(window.navigator.language),
    });
  },
};
