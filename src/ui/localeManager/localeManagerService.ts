import { updateI18nLocale } from '@/infrastructure/plugins/i18n';
import { updatePrimevueLocale } from '@/infrastructure/plugins/primevue';

export function updateAppLocale(newLocale: string) {
  updateI18nLocale(newLocale);
  updatePrimevueLocale(newLocale);
}
