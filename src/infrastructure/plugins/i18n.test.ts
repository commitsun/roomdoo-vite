import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Mock de dependencias (no del SUT) --------------------------------------
vi.mock('vue-i18n', () => {
  const createI18n = vi.fn((_opts?: any) => {
    const global = {
      locale: { value: 'en' },
      fallbackLocale: { value: 'en' },
      availableLocales: [] as string[],
      t: (k: string) => k,
      setLocaleMessage: vi.fn((loc: string) => {
        if (!global.availableLocales.includes(loc)) {
          global.availableLocales.push(loc);
        }
      }),
      removeLocaleMessage: vi.fn((loc: string) => {
        const i = global.availableLocales.indexOf(loc);
        if (i >= 0) global.availableLocales.splice(i, 1);
      }),
    };
    return { global };
  });
  return { createI18n };
});

vi.mock('@intlify/unplugin-vue-i18n/messages', () => ({
  default: { en: {}, es: {} },
}));

// --- Helper minimal ----------------------------------------------------------
async function setup({
  storedLocale,
  navLanguages = ['en-US'],
}: { storedLocale?: string | null; navLanguages?: string[] } = {}) {
  vi.resetModules();

  Object.defineProperty(window.navigator, 'languages', {
    configurable: true,
    value: navLanguages,
  });

  localStorage.clear();
  if (storedLocale !== undefined) {
    if (storedLocale === null) localStorage.removeItem('app.locale');
    else localStorage.setItem('app.locale', storedLocale);
  }
  const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

  const mod = await import('@/infrastructure/plugins/i18n'); // ← ajusta si tu ruta difiere
  return { mod: mod as any, setItemSpy };
}

const valuesOf = (arr: Array<{ label: string; value: string }>) => arr.map((x) => x.value);

describe('updateI18nAvailableLocales', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    {
      name: 'undefined -> DEFAULT [es,en], keeps "en"',
      input: undefined,
      nav: ['en-US'],
      expectedAvail: ['es', 'en'],
      expectedLocale: 'en',
      expectSetItem: false,
    },
    {
      name: 'empty [] -> DEFAULT [es,en], keeps "en"',
      input: [] as Array<{ code: string }>,
      nav: ['en-US'],
      expectedAvail: ['es', 'en'],
      expectedLocale: 'en',
      expectSetItem: false,
    },
    {
      name: 'only es-ES -> ["es"], switches to "es"',
      input: [{ code: 'es-ES' }],
      nav: ['en-US'],
      expectedAvail: ['es'],
      expectedLocale: 'es',
      expectSetItem: true,
    },
    {
      name: 'only en-US -> ["en"], keeps "en"',
      input: [{ code: 'en-US' }],
      nav: ['en-US'],
      expectedAvail: ['en'],
      expectedLocale: 'en',
      expectSetItem: false,
    },
    {
      name: 'es-ES + en-GB -> ["es","en"], keeps "en"',
      input: [{ code: 'es-ES' }, { code: 'en-GB' }],
      nav: ['en-US'],
      expectedAvail: ['es', 'en'],
      expectedLocale: 'en',
      expectSetItem: false,
    },
    {
      name: 'only gl -> fallback DEFAULT [es,en], keeps "en"',
      input: [{ code: 'gl' }],
      nav: ['en-US'],
      expectedAvail: ['es', 'en'],
      expectedLocale: 'en',
      expectSetItem: false,
    },
  ])(
    'filters & syncs: $name',
    async ({ input, nav, expectedAvail, expectedLocale, expectSetItem }) => {
      const { mod, setItemSpy } = await setup({ storedLocale: null, navLanguages: nav });
      const { updateI18nAvailableLocales, availableLocales, i18n } = mod;

      const ret = updateI18nAvailableLocales(input);

      expect(valuesOf(ret.value)).toEqual(expectedAvail);
      expect(valuesOf(availableLocales.value)).toEqual(expectedAvail);
      expect(i18n.global.availableLocales.sort()).toEqual([...expectedAvail].sort());
      expect(i18n.global.locale.value).toBe(expectedLocale);

      if (expectSetItem) {
        expect(setItemSpy).toHaveBeenCalledWith('app.locale', expectedLocale);
      } else {
        expect(setItemSpy).not.toHaveBeenCalledWith('app.locale', expect.anything());
      }
    }
  );

  it('changes locale when current is not in the resulting list', async () => {
    const { mod, setItemSpy } = await setup({ storedLocale: null, navLanguages: ['es-ES'] });
    const { updateI18nAvailableLocales, availableLocales, i18n } = mod;

    i18n.global.locale.value = 'fr'; // inválido

    const ret = updateI18nAvailableLocales([{ code: 'en-US' }]);

    expect(valuesOf(ret.value)).toEqual(['en']);
    expect(valuesOf(availableLocales.value)).toEqual(['en']);
    expect(i18n.global.availableLocales).toEqual(['en']);
    expect(i18n.global.locale.value).toBe('en');
    expect(setItemSpy).toHaveBeenCalledWith('app.locale', 'en');
  });

  it('keeps current if still valid after narrowing list', async () => {
    const { mod, setItemSpy } = await setup({ storedLocale: 'en', navLanguages: ['es-ES'] });
    const { updateI18nAvailableLocales, i18n } = mod;

    expect(i18n.global.locale.value).toBe('en');

    updateI18nAvailableLocales([{ code: 'en' }]);

    expect(i18n.global.locale.value).toBe('en');
    // No debe escribir un valor distinto
    expect(setItemSpy).not.toHaveBeenCalledWith('app.locale', 'es');
  });

  it('falls back to DEFAULT [es,en] when there is no intersection', async () => {
    const { mod } = await setup();
    const { updateI18nAvailableLocales, availableLocales, i18n } = mod;

    updateI18nAvailableLocales([{ code: 'gl-ES' }]);

    expect(valuesOf(availableLocales.value)).toEqual(['es', 'en']);
    expect(i18n.global.availableLocales.sort()).toEqual(['es', 'en'].sort());
  });
});
