import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import LoginPage from './LoginPage.vue';
import PrimeVue from 'primevue/config';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import { createI18n } from 'vue-i18n';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      username: 'Username',
      password: 'Password',
      sign_in: 'Sign in',
      forgot_password: 'Forgot your password?',
      email_label: 'Email',
    },
  },
});

describe('LoginPage.vue', () => {
  const globalConfig = {
    global: {
      plugins: [PrimeVue, i18n],
      components: { InputText, Password, Button },
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
