import { en_GB } from 'primelocale/js/en_GB.js';
import { en } from 'primelocale/js/en.js';
import { es } from 'primelocale/js/es.js';

const availableLocales = ['en', 'es'];
const browserLang = window.navigator.language.toLowerCase();
const baseLang = browserLang.substring(0, 2);

export const selectedLang = ['es', 'gl', 'ca'].includes(baseLang) ? 'es' : 'en';

export const locale = (() => {
  const area = browserLang.split('-')[1]?.toUpperCase();
  if (selectedLang === 'es' || baseLang === 'gl' || baseLang === 'ca') {
    return es;
  }
  return area === 'GB' ? en_GB : en;
})();
