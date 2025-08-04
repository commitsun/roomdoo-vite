import { describe, it, expect, vi } from 'vitest';

const pushMock = vi.fn();

// Mock del router
vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router');
  return {
    ...actual,
    useRouter: () => ({ push: pushMock }),
  };
});

vi.mock('@/ui/plugins/i18n', async () => {
  const { createI18n } = await import('vue-i18n');
  const en = (await import('@/infrastructure/locales/en.json')).default;

  const SUPPORTED_LOCALES = [
    { label: 'Español', value: 'es' },
    { label: 'English', value: 'en' },
  ];

  return {
    i18n: createI18n({
      legacy: false,
      locale: 'en',
      globalInjection: true,
      messages: { en },
    }),
    SUPPORTED_LOCALES,
    updateI18nAvailableLocales: (languages?: Array<{ code: string }>) => {
      if (!languages || languages.length === 0) return SUPPORTED_LOCALES;
      const codes = languages.map((l) => l.code.split('_')[0]);
      return SUPPORTED_LOCALES.filter((locale) => codes.includes(locale.value));
    },
  };
});

import { mount } from '@vue/test-utils';
import PrimeVue from 'primevue/config';
import Select from 'primevue/select';
import { createTestingPinia } from '@pinia/testing';
import router from '@/ui/plugins/router';
import { i18n } from '@/ui/plugins/i18n';
import LoginLayout from './LoginLayout.vue';

describe('LoginLayout.vue', () => {
  const globalConfig = {
    global: {
      plugins: [
        PrimeVue,
        router,
        i18n,
        createTestingPinia({
          stubActions: false,
          createSpy: vi.fn,
        }),
      ],
      components: {
        Select,
      },
    },
  };

  it('redirects to hotel-not-found if fetchInstance fails', async () => {
    vi.mock('@/infrastructure/stores/instance', () => ({
      useInstanceStore: () => ({
        fetchInstance: vi.fn().mockRejectedValue(new Error('Server error')),
        instance: null,
      }),
    }));

    vi.mock('@/infrastructure/stores/ui', () => ({
      useUIStore: () => ({ stopLoading: vi.fn() }),
    }));

    mount(LoginLayout, globalConfig);
    await new Promise((resolve) => setImmediate(resolve));

    expect(pushMock).toHaveBeenCalledWith({ name: 'hotel-not-found' });
  });

  it('shows language selector if more than one locale is available', async () => {
    vi.mock('@/infrastructure/stores/instance', () => ({
      useInstanceStore: () => ({
        fetchInstance: vi.fn().mockResolvedValue(undefined),
        instance: {
          image: '',
          languages: [{ code: 'en' }, { code: 'es' }],
        },
      }),
    }));

    vi.mock('@/infrastructure/stores/ui', () => ({
      useUIStore: () => ({ stopLoading: vi.fn() }),
    }));

    const wrapper = mount(LoginLayout, globalConfig);
    await new Promise((resolve) => setImmediate(resolve));

    expect(wrapper.find('.select-language').exists()).toBe(true);
  });

  it('does not show language selector if only one locale is available', async () => {
    vi.mock('@/infrastructure/stores/instance', () => ({
      useInstanceStore: () => ({
        fetchInstance: vi.fn().mockResolvedValue(undefined),
        instance: {
          image: '',
          languages: ['en'],
        },
      }),
    }));

    vi.mock('@/infrastructure/stores/ui', () => ({
      useUIStore: () => ({ stopLoading: vi.fn() }),
    }));

    const wrapper = mount(LoginLayout, globalConfig);
    await new Promise((resolve) => setImmediate(resolve));
    // log languages
    console.log('Available languages:', i18n.global.availableLocales);
    expect(wrapper.find('.select-language').exists()).toBe(false);
  });
});
