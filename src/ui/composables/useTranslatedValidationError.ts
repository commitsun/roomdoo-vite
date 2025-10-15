import { useI18n } from 'vue-i18n';

/**
 * Translates a validation error message, supporting dynamic values passed like:
 *   "validation.MAX_GUESTS:4" → "No puedes añadir más de 4 huéspedes"
 */
export function useTranslatedError(): { translate: (error?: string) => string | undefined } {
  const { t } = useI18n();

  function translate(error?: string): string | undefined {
    if (error === null) {
      return undefined;
    }

    const [fullKey, params] =
      error !== undefined && error !== null ? error.split(':') : ['', undefined];
    const key = fullKey?.startsWith('validation.') ? fullKey : `validation.${fullKey}`;

    const namedParams: Record<string, string> = {};

    if (params !== undefined) {
      namedParams.count = params;
    }

    const translated = t(key, namedParams);
    return translated === key ? error : translated; // fallback: return raw error if not found
  }

  return { translate };
}
