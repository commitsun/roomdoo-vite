import { createI18n, type I18nOptions } from 'vue-i18n';
import messages from '@intlify/unplugin-vue-i18n/messages';
import { selectedLang } from '@/plugins/locale';

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: selectedLang,
  fallbackLocale: 'en',
  availableLocales: ['es', 'en'],
  messages,
} as I18nOptions);
