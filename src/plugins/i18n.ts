import { createI18n, type I18nOptions } from 'vue-i18n';
import messages from '@intlify/unplugin-vue-i18n/messages';


export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: window.navigator.language.substring(0, 2) || 'en',
  fallbackLocale: 'en',
  availableLocales: ['es', 'en'],
  messages: messages,
} as I18nOptions);

