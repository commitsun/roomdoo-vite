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
      50: '{blue.50}',
      100: '{blue.100}',
      200: '{blue.200}',
      300: '{blue.300}',
      400: '{blue.400}',
      500: '{blue.500}',
      600: '{blue.600}',
      700: '{blue.700}',
      800: '{blue.800}',
      900: '{blue.900}',
      950: '{blue.950}',
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
