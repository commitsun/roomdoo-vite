import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import PrimeVue from 'primevue/config';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import { createTestingPinia } from '@pinia/testing';
import router from '@/ui/plugins/router';

// 👇 Mock del plugin i18n
vi.mock('@/ui/plugins/i18n', async () => {
  const { createI18n } = await import('vue-i18n');
  const en = (await import('@/infrastructure/locales/en.json')).default;
  return {
    i18n: createI18n({
      legacy: false,
      locale: 'en',
      globalInjection: true,
      messages: { en },
    }),
  };
});

import { i18n } from '@/ui/plugins/i18n';
import LoginPage from './LoginPage.vue';

describe('LoginPage.vue', () => {
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
        InputText,
        Password,
        Button,
      },
    },
  };

  it('disables the button when username and password are empty', () => {
    const wrapper = mount(LoginPage, globalConfig);
    const button = wrapper.get('button');
    expect(button.element.disabled).toBe(true);
  });

  it('disables the button when only username is filled', async () => {
    const wrapper = mount(LoginPage, globalConfig);
    await wrapper.get('input[type="text"]').setValue('user@example.com');
    const button = wrapper.get('button');
    expect(button.element.disabled).toBe(true);
  });

  it('disables the button when only password is filled', async () => {
    const wrapper = mount(LoginPage, globalConfig);
    await wrapper.get('input[type="password"]').setValue('secret');
    const button = wrapper.get('button');
    expect(button.element.disabled).toBe(true);
  });

  it('enables the button when both username and password are filled', async () => {
    const wrapper = mount(LoginPage, globalConfig);
    await wrapper.get('input[type="text"]').setValue('user@example.com');
    await wrapper.get('input[type="password"]').setValue('secret');
    const button = wrapper.get('button');
    expect(button.element.disabled).toBe(false);
  });
});
