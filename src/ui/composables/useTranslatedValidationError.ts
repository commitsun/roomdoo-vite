import { useI18n } from 'vue-i18n';

/**
 * Translates a validation error message, supporting dynamic values passed like:
 *   "validation.MAX_GUESTS:4" → "No puedes añadir más de 4 huéspedes"
 */
export function useTranslatedError() {
  const { t } = useI18n();

  function translate(error?: string): string | undefined {
    if (!error) return;

    const [fullKey, params] = error.split(':');
    const key = fullKey?.startsWith('validation.') ? fullKey : `validation.${fullKey}`;

    const namedParams: Record<string, string> = {};

    // Try to infer param name from key (e.g. MAX_GUESTS → { max_guests: value })
    const paramKey = key.split('.').pop()?.toLowerCase() || 'value';

    if (params) {
      namedParams[paramKey] = params;
    }

    const translated = t(key, namedParams);
    return translated === key ? error : translated; // fallback: return raw error if not found
  }

  return { translate };
}
