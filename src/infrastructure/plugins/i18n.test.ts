import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@intlify/unplugin-vue-i18n/messages', () => {
  return {
    default: {
      'en-US': {
        hello: 'Hello',
        greet: 'Hi {name}',
        listFmt: 'A {0} and {1}',
        color: 'Color: {color}',
      },
      'es-ES': {
        hello: 'Hola',
        greet: 'Hola {name}',
        listFmt: 'Un {0} y un {1}',
        color: 'Color: {color}',
      },
      'gl-ES': {
        hello: 'Ola',
        greet: 'Ola {name}',
        listFmt: 'Un {0} e un {1}',
        color: 'Cor: {color}',
      },
    },
  };
});

vi.mock('@/application/instance/InstanceService', () => {
  return {
    APP_LANGUAGES: [
      { code: 'en-US', name: 'English' },
      { code: 'es-ES', name: 'Español' },
      { code: 'gl-ES', name: 'Galego' },
    ],
  };
});

function mockNavigatorLanguage(lang: string) {
  // Spy the getter of `navigator.language`
  return vi.spyOn(window.navigator, 'language', 'get').mockReturnValue(lang);
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
});

describe('locale auto-detection based on browser language', () => {
  it('uses es-ES when base language is one of [es, gl, ca, eu] (e.g., es-ES)', async () => {
    mockNavigatorLanguage('es-ES');
    const { i18n } = await import('@/infrastructure/plugins/i18n');
    expect(i18n.global.locale.value).toBe('es-ES');
  });

  it('uses es-ES when base language is gl (e.g., gl-ES)', async () => {
    mockNavigatorLanguage('gl-ES');
    const { i18n } = await import('@/infrastructure/plugins/i18n');
    expect(i18n.global.locale.value).toBe('es-ES');
  });

  it('falls back to en-US when base language is not in the allowlist (e.g., fr-FR)', async () => {
    mockNavigatorLanguage('fr-FR');
    const { i18n } = await import('@/infrastructure/plugins/i18n');
    expect(i18n.global.locale.value).toBe('en-US');
  });
});

describe('availableLocales comes from APP_LANGUAGES and messsages keys', () => {
  it('exposes availableLocales from APP_LANGUAGES codes', async () => {
    mockNavigatorLanguage('en-US'); // value does not matter for this test
    const { i18n } = await import('@/infrastructure/plugins/i18n');
    // availableLocales is a plain array inside i18n options; vue-i18n exposes it on global
    const locales = i18n.global.availableLocales;
    expect(locales).toEqual(expect.arrayContaining(['en-US', 'es-ES', 'gl-ES']));
  });
});

describe('t() translator helper', () => {
  it('returns a translation for a simple key (no params)', async () => {
    mockNavigatorLanguage('en-US');
    const { t, i18n } = await import('@/infrastructure/plugins/i18n');
    i18n.global.locale.value = 'en-US';
    expect(t('hello')).toBe('Hello');

    i18n.global.locale.value = 'es-ES';
    expect(t('hello')).toBe('Hola');
  });

  it('supports named params', async () => {
    mockNavigatorLanguage('es-ES');
    const { t, i18n } = await import('@/infrastructure/plugins/i18n');
    i18n.global.locale.value = 'es-ES';
    expect(t('greet', { name: 'Miguel' })).toBe('Hola Miguel');
  });

  it('supports list params', async () => {
    mockNavigatorLanguage('en-US');
    const { t, i18n } = await import('@/infrastructure/plugins/i18n');
    i18n.global.locale.value = 'en-US';
    expect(t('listFmt', ['cat', 'dog'])).toBe('A cat and dog');

    i18n.global.locale.value = 'es-ES';
    expect(t('listFmt', ['gato', 'perro'])).toBe('Un gato y un perro');
  });

  it('honors options + params (e.g., translate with explicit locale)', async () => {
    mockNavigatorLanguage('fr-FR'); // default would be en-US
    const { t } = await import('@/infrastructure/plugins/i18n');
    // Ask Spanish explicitly via options
    expect(t('color', { color: 'rojo' }, { locale: 'es-ES' })).toBe('Color: rojo');
    // Ask English explicitly
    expect(t('color', { color: 'red' }, { locale: 'en-US' })).toBe('Color: red');
  });
});
