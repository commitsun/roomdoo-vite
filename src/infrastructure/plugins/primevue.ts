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
      50: '{emerald.50}',
      100: '{emerald.100}',
      200: '{emerald.200}',
      300: '{emerald.300}',
      400: '{emerald.400}',
      500: '{emerald.500}',
      600: '{emerald.600}',
      700: '{emerald.700}',
      800: '{emerald.800}',
      900: '{emerald.900}',
      950: '{emerald.950}',
    },
    colorScheme: {
      light: {
        primary: {
          color: '{primary.700}',
        },
      },
    },
  },
  components: {
    togglebutton: {
      colorScheme: {
        light: {
          root: {
            checkedColor: '{primary.color}',
          },
        },
      },
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
