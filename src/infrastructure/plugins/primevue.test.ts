import { describe, it, expect, vi, afterEach } from 'vitest';
import type { App } from 'vue';

vi.mock('@primeuix/themes/aura', () => {
  return { default: { __aura: true } };
});

const definePresetSpy = vi.fn((base: unknown, ext: unknown) => ({ __preset: true, base, ext }));
vi.mock('@primevue/themes', () => {
  return { definePreset: definePresetSpy };
});

vi.mock('primelocale/js/en_GB.js', () => ({
  en_GB: { mark: 'en_GB', weekStart: 1 },
}));
vi.mock('primelocale/js/en.js', () => ({
  en: { mark: 'en', weekStart: 0 },
}));
vi.mock('primelocale/js/es.js', () => ({
  es: { mark: 'es', weekStart: 1 },
}));

const primeVueInstallSpy = vi.fn();
vi.mock('primevue/config', () => {
  return {
    default: {
      install(app: App, options: any) {
        primeVueInstallSpy(options);
        app.config.globalProperties.$primevue = {
          config: {
            theme: options?.theme ?? {},
            locale: options?.locale ?? {},
          },
        };
      },
    },
  };
});

function mockNavigatorLanguage(lang: string) {
  return vi.spyOn(window.navigator, 'language', 'get').mockReturnValue(lang);
}

function makeApp(): App {
  const app: any = {
    config: { globalProperties: {} },
    use(plugin: any, options?: any) {
      if (typeof plugin?.install === 'function') {
        plugin.install(app, options);
      }
      return app;
    },
  };
  return app as App;
}

async function importPlugin() {
  // fresh import each time to get a fresh module scope (primevueApp=null)
  return import('@/infrastructure/plugins/primevue'); // <- adjust path to your file
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
  primeVueInstallSpy.mockClear();
  definePresetSpy.mockClear();
});

describe('RoomdooPreset', () => {
  it('is created via definePreset with Aura base and custom primary palette', async () => {
    const { RoomdooPreset } = await importPlugin();
    // returned preset sentinel
    expect(RoomdooPreset).toMatchObject({ __preset: true });

    // assert definePreset was called with Aura and an extension containing our primary colors
    expect(definePresetSpy).toHaveBeenCalledTimes(1);
    const [, ext] = definePresetSpy.mock.calls[0];
    expect((ext as any).semantic?.primary?.[500]).toBe('#1D4ED8'); // sample key
    expect((ext as any).semantic?.primary?.[50]).toBe('#e3f3fc'); // another key
  });
});

describe('plugin install (default locale selection)', () => {
  it('uses ES locale for es/gl/ca/eu base languages', async () => {
    mockNavigatorLanguage('gl-ES');
    const plugin = await importPlugin();
    const app = makeApp();
    plugin.default.install(app);

    const locale = (app.config.globalProperties as any).$primevue.config.locale;
    expect(locale).toMatchObject({ mark: 'es', weekStart: 1 });
  });

  it('uses en_GB for en-GB', async () => {
    mockNavigatorLanguage('en-GB');
    const plugin = await importPlugin();
    const app = makeApp();
    plugin.default.install(app);

    const locale = (app.config.globalProperties as any).$primevue.config.locale;
    expect(locale).toMatchObject({ mark: 'en_GB', weekStart: 1 });
  });

  it('falls back to en for non-listed languages (e.g., fr-FR)', async () => {
    mockNavigatorLanguage('fr-FR');
    const plugin = await importPlugin();
    const app = makeApp();
    plugin.default.install(app);

    const locale = (app.config.globalProperties as any).$primevue.config.locale;
    expect(locale).toMatchObject({ mark: 'en', weekStart: 0 });
  });

  it('passes theme preset to PrimeVue install', async () => {
    mockNavigatorLanguage('en-US');
    const plugin = await importPlugin();
    const app = makeApp();
    plugin.default.install(app);

    expect(primeVueInstallSpy).toHaveBeenCalledTimes(1);
    const options = primeVueInstallSpy.mock.calls[0][0];
    expect(options?.theme?.preset).toMatchObject({ __preset: true });
    // darkModeSelector is explicitly false in your plugin
    expect(options?.theme?.options?.darkModeSelector).toBe(false);
  });
});

describe('updatePrimevueLocale', () => {
  it('merges new locale into existing $primevue.config.locale (keeps reference)', async () => {
    mockNavigatorLanguage('en-US'); // initial install will set EN
    const plugin = await importPlugin();
    const app = makeApp();
    plugin.default.install(app);

    const cfg = (app.config.globalProperties as any).$primevue.config;
    const initialLocaleRef = cfg.locale;
    expect(initialLocaleRef).toMatchObject({ mark: 'en', weekStart: 0 });

    // Update to Spanish; should mutate the existing object via Object.assign
    plugin.updatePrimevueLocale('es-ES');

    expect(cfg.locale).toBe(initialLocaleRef); // same reference
    expect(cfg.locale).toMatchObject({ mark: 'es', weekStart: 1 });
  });

  it('chooses ES for ca/gl/eu base languages when updating', async () => {
    mockNavigatorLanguage('en-US'); // install with EN first
    const plugin = await importPlugin();
    const app = makeApp();
    plugin.default.install(app);

    const cfg = (app.config.globalProperties as any).$primevue.config;

    plugin.updatePrimevueLocale('eu-ES');
    expect(cfg.locale).toMatchObject({ mark: 'es' });

    plugin.updatePrimevueLocale('ca-ES');
    expect(cfg.locale).toMatchObject({ mark: 'es' });

    plugin.updatePrimevueLocale('gl-ES');
    expect(cfg.locale).toMatchObject({ mark: 'es' });
  });

  it('chooses en_GB when updating to en-GB', async () => {
    mockNavigatorLanguage('en-US');
    const plugin = await importPlugin();
    const app = makeApp();
    plugin.default.install(app);

    const cfg = (app.config.globalProperties as any).$primevue.config;

    plugin.updatePrimevueLocale('en-GB');
    expect(cfg.locale).toMatchObject({ mark: 'en_GB' });
  });
});
