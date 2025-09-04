import { createI18n, type NamedValue, type TranslateOptions } from 'vue-i18n';
import messages from '@intlify/unplugin-vue-i18n/messages';
import { APP_LANGUAGES } from '@/application/instance/InstanceService';

const browserLang = window.navigator.language.toLowerCase();
const baseLang = browserLang.substring(0, 2);

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: ['es', 'gl', 'ca', 'eu'].includes(baseLang) ? 'es' : 'en',
  fallbackLocale: 'en',
  availableLocales: APP_LANGUAGES.map((l) => l.code),
  messages,
});

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
