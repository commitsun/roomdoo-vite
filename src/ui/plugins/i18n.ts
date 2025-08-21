import { createI18n } from 'vue-i18n';
import messages from '@intlify/unplugin-vue-i18n/messages';
import { en_GB } from 'primelocale/js/en_GB.js';
import { en } from 'primelocale/js/en.js';
import { es } from 'primelocale/js/es.js';

const browserLang = window.navigator.language.toLowerCase();
const baseLang = browserLang.substring(0, 2);

export const selectedLang = ['es', 'gl', 'ca', 'eu'].includes(baseLang) ? 'es' : 'en';

export const locale = (() => {
  const area = browserLang.split('-')[1]?.toUpperCase();
  if (selectedLang === 'es' || baseLang === 'gl' || baseLang === 'ca' || baseLang === 'eu') {
    return es;
  }
  return area === 'GB' ? en_GB : en;
})();

export const SUPPORTED_LOCALES = [
  { label: 'Español', value: 'es' },
  { label: 'English', value: 'en' },
];

export let availableLocales = SUPPORTED_LOCALES;

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: selectedLang,
  fallbackLocale: 'en',
  availableLocales: SUPPORTED_LOCALES.map((locale) => locale.value),
  messages,
});

export const getLocale = () => {
  return i18n.global.locale.value;
};

export function updateI18nLocale(newLocale: string) {
  i18n.global.locale.value = newLocale;
}

export function updateI18nAvailableLocales(languages?: Array<{ code: string }>) {
  availableLocales = SUPPORTED_LOCALES;
  if (languages && languages.length > 0) {
    const codes = languages.map((l) => l.code.split('_')[0]);
    availableLocales = SUPPORTED_LOCALES.filter((locale) => codes.includes(locale.value));
  }
  return availableLocales;
}
