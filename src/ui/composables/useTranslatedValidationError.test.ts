import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Mock de vue-i18n ---
const messages: Record<string, string> = {
  'validation.REQUIRED': 'Campo obligatorio',
  'validation.INVALID_EMAIL': 'Email inválido',
  'validation.MAX_GUESTS': 'No puedes añadir más de {count} huéspedes',
};

// t
const tMock = vi.fn((key: string, params?: Record<string, any>) => {
  const msg = messages[key];
  if (!msg) {
    return key;
  }
  return msg.replace('{count}', params?.count ?? '');
});

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: tMock }),
}));

import { useTranslatedError } from './useTranslatedValidationError';

describe('useTranslatedError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns undefined if error is null or undefined', () => {
    const { translate } = useTranslatedError();
    expect(translate(null as unknown as string)).toBeUndefined();
    expect(translate(undefined)).toBeUndefined();
  });

  it('translates key with validation. prefix', () => {
    const { translate } = useTranslatedError();
    expect(translate('validation.REQUIRED')).toBe('Campo obligatorio');
    expect(tMock).toHaveBeenCalledWith('validation.REQUIRED', {});
  });

  it('translates key without prefix by adding "validation."', () => {
    const { translate } = useTranslatedError();
    expect(translate('INVALID_EMAIL')).toBe('Email inválido');
    expect(tMock).toHaveBeenCalledWith('validation.INVALID_EMAIL', {});
  });

  it('replaces the count parameter when it comes with a colon', () => {
    const { translate } = useTranslatedError();
    expect(translate('validation.MAX_GUESTS:4')).toBe('No puedes añadir más de 4 huéspedes');
    expect(tMock).toHaveBeenCalledWith('validation.MAX_GUESTS', { count: '4' });
  });

  it('also works without a prefix when there is a parameter', () => {
    const { translate } = useTranslatedError();
    expect(translate('MAX_GUESTS:3')).toBe('No puedes añadir más de 3 huéspedes');
    expect(tMock).toHaveBeenCalledWith('validation.MAX_GUESTS', { count: '3' });
  });

  it('if the key does not exist, returns the original error (fallback)', () => {
    const { translate } = useTranslatedError();
    expect(translate('FOO_BAR')).toBe('FOO_BAR');
    expect(translate('validation.DOES_NOT_EXIST')).toBe('validation.DOES_NOT_EXIST');
  });

  it('does not duplicate the prefix if it already comes with validation.', () => {
    const { translate } = useTranslatedError();
    translate('validation.REQUIRED');
    const allKeys = tMock.mock.calls.map((c) => c[0]);
    expect(allKeys).not.toContain('validation.validation.REQUIRED');
  });
});
