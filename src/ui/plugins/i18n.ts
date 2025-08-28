import { createI18n, type NamedValue, type TranslateOptions } from 'vue-i18n';
import messages from '@intlify/unplugin-vue-i18n/messages';

const browserLang = window.navigator.language.toLowerCase();
const baseLang = browserLang.substring(0, 2);

export let availableLocales = [
  { label: 'Español', value: 'es' },
  { label: 'English', value: 'en' },
];

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: ['es', 'gl', 'ca', 'eu'].includes(baseLang) ? 'es' : 'en',
  fallbackLocale: 'en',
  availableLocales: availableLocales.map((locale) => locale.value),
  messages,
});

export function updateI18nLocale(newLocale: string) {
  i18n.global.locale.value = newLocale;
}

export function updateI18nAvailableLocales(languages?: Array<{ code: string }>) {
  if (languages && languages.length > 0) {
    const codes = languages.map((l) => l.code.split('_')[0]);
    availableLocales = availableLocales.filter((locale) => codes.includes(locale.value));
  }
  return availableLocales;
}
export function t(key: string): string;
export function t(key: string, params: NamedValue | unknown[]): string;
export function t(
  key: string,
  params: NamedValue | unknown[],
  options: TranslateOptions<string>
): string;

export function t(
  key: string,
  params?: NamedValue | unknown[],
  options?: TranslateOptions<string>
): string {
  const g = i18n.global;
  if (options !== undefined && params !== undefined) {
    return g.t(key, params as any, options) as string;
  }
  if (params !== undefined) {
    return g.t(key, params as any) as string;
  }
  return g.t(key) as string;
}
