import { type App, h } from 'vue';
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primevue/themes';
import { en_GB } from 'primelocale/js/en_GB.js';
import { en } from 'primelocale/js/en.js';
import { es } from 'primelocale/js/es.js';
import { LucideIconMap } from '@/ui/lucide-icons';

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
      icons: {
        // core / common
        close: { component: LucideIconMap.close },
        spinner: {
          // render lets you add animation class; component is fine too
          render: (props: any) => h(LucideIconMap.spinner, { class: 'animate-spin', ...props }),
        },

        // navigation
        chevronDown: { component: LucideIconMap.chevronDown },
        chevronUp: { component: LucideIconMap.chevronUp },
        chevronLeft: { component: LucideIconMap.chevronLeft },
        chevronRight: { component: LucideIconMap.chevronRight },

        // actions / statuses
        search: { component: LucideIconMap.search },
        calendar: { component: LucideIconMap.calendar },
        check: { component: LucideIconMap.check },
        info: { component: LucideIconMap.info },
        warning: { component: LucideIconMap.warning },
        error: { component: LucideIconMap.error },
        success: { component: LucideIconMap.success },
        download: { component: LucideIconMap.download },
        upload: { component: LucideIconMap.upload },
        plus: { component: LucideIconMap.plus },
        minus: { component: LucideIconMap.minus },
      },

      // (Optional) PT to tuning some components if needed
      // pt: {
      //   dialog: { closeButtonIcon: { as: LucideIconMap.close } },
      //   button: { loadingIcon: { as: LucideIconMap.spinner } },
      // },
    });
  },
};
