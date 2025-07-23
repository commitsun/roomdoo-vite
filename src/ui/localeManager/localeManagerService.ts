import { updateI18nLocale } from '@/ui/plugins/i18n';
import { updatePrimevueLocale } from '@/ui/plugins/primevue';

export function updateAppLocale(newLocale: string) {
  updateI18nLocale(newLocale);
  updatePrimevueLocale(newLocale);
}
