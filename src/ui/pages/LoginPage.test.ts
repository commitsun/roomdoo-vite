import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/vue';
import '@testing-library/jest-dom/vitest';
import { createTestingPinia } from '@pinia/testing';
import { useUserStore } from '@/infrastructure/stores/user';
import { UnauthorizedError } from '@/application/shared/UnauthorizedError';
import Login from './LoginPage.vue';
import { reactive } from 'vue';

type MockRoute = {
  query: Record<string, string>;
  params: Record<string, string>;
  name?: string;
  fullPath?: string;
};

const route = reactive<MockRoute>({
  query: {},
  params: {},
  name: 'login',
  fullPath: '/login',
});

const replace = vi.fn();

vi.mock('vue-router', () => ({
  useRouter: () => ({ replace }),
  useRoute: () => route,
}));

vi.mock('vue-i18n', () => {
  const tMap: Record<string, string> = {
    'login.username': 'Username',
    'login.password': 'Password',
    'login.loginButton': 'Log in',
    'login.invalidCredentials': 'Invalid credentials',
    'login.email': 'Email',
    'login.forgotPassword': 'Forgot your password?',
    'error.unknownError': 'Unknown error',
  };
  const global = {
    locale: { value: 'en' },
    fallbackLocale: { value: 'en' },
    availableLocales: ['en', 'es'],
    t: (key: string, _params?: unknown) => tMap[key] ?? key,
    setLocaleMessage: vi.fn(),
    removeLocaleMessage: vi.fn(),
  };

  return {
    useI18n: () => ({ t: (k: string) => tMap[k] ?? k }),
    createI18n: vi.fn(() => ({ global, install: () => {} })),
  };
});

vi.mock('@/_legacy/utils/useLegacyStore', () => ({
  useLegacyStore: () => ({ doVuexLogin: vi.fn().mockResolvedValue(undefined) }),
}));

vi.mock('@/infrastructure/stores/instance', () => ({
  useInstanceStore: () => ({ instance: { name: 'Roomdoo Cloud' } }),
}));

const InputTextStub = {
  name: 'InputText',
  inheritAttrs: false,
  template: `
    <input
      v-bind="$attrs"
      type="text"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  `,
};

const PasswordStub = {
  name: 'Password',
  inheritAttrs: false,
  template: `
    <input
      v-bind="$attrs"
      type="password"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  `,
};

const ButtonStub = {
  name: 'Button',
  props: ['disabled', 'label'],
  template: `<button :disabled="disabled">{{ label }}<slot /></button>`,
};

describe('LoginPage', () => {
  beforeEach(() => {
    replace.mockClear();
    route.query = {};
    route.params = {};
    route.name = 'login';
    route.fullPath = '/login';
    const pinia = createTestingPinia({
      stubActions: true,
      createSpy: vi.fn,
    });
    render(Login, {
      global: {
        plugins: [pinia],
        stubs: {
          InputText: InputTextStub,
          Password: PasswordStub,
          Button: ButtonStub,
          IconField: { template: '<div><slot/></div>' },
          InputIcon: { template: '<i />' },
          Message: { template: '<div role="alert"><slot/></div>' },
        },
      },
    });
  });
  it('enables button when the username and password are filled in', async () => {
    const inputEmail = screen.getByRole('textbox', { name: 'Username' });
    const inputPassword = screen.getByLabelText('Password');
    const btn = screen.getByRole('button', { name: 'Log in' });
    await fireEvent.update(inputEmail, 'username');
    await fireEvent.update(inputPassword, 'password');
    expect(btn).toBeEnabled();
  });
  it('disables button when the username or password are not filled in', async () => {
    const inputEmail = screen.getByRole('textbox', { name: 'Username' });
    const inputPassword = screen.getByLabelText('Password');
    const btn = screen.getByRole('button', { name: 'Log in' });

    await fireEvent.update(inputEmail, '');
    await fireEvent.update(inputPassword, '');
    expect(btn).toBeDisabled();

    await fireEvent.update(inputEmail, '');
    await fireEvent.update(inputPassword, 'password');
    expect(btn).toBeDisabled();

    await fireEvent.update(inputEmail, 'username');
    await fireEvent.update(inputPassword, '');
    expect(btn).toBeDisabled();
  });

  it('displays "Invalid credentials" when login is incorrect', async () => {
    const userStore = useUserStore();
    vi.spyOn(userStore, 'login').mockRejectedValueOnce(new UnauthorizedError('bad'));

    const email = screen.getByRole('textbox', { name: 'Username' });
    const pass = screen.getByLabelText('Password');
    const btn = screen.getByRole('button', { name: 'Log in' });

    await fireEvent.update(email, 'test@roomdoo.com');
    await fireEvent.update(pass, 'wrong');
    await fireEvent.click(btn);

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid credentials');
  });

  it('call login with credentials & redirects to "/" when login is correct', async () => {
    const userStore = useUserStore();
    vi.spyOn(userStore, 'login');
    vi.spyOn(useUserStore(), 'user', 'get').mockReturnValue({
      id: 1,
      email: 'a@b.c',
      languageId: 1,
      defaultPmsProperty: { id: 2, name: 'prop', image: '' },
      firstName: '',
      lastName: '',
    });

    const inputEmail = screen.getByRole('textbox', { name: 'Username' });
    const inputPassword = screen.getByLabelText('Password');
    const btn = screen.getByRole('button', { name: 'Log in' });

    await fireEvent.update(inputEmail, 'user@example.com');
    await fireEvent.update(inputPassword, 'secret');
    await fireEvent.click(btn);

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/'));
    expect(userStore.login).toHaveBeenCalledWith('user@example.com', 'secret');
  });

  it('redirects to query in url params', async () => {
    const routeToRedirect = '/planning';
    route.query = { redirect: routeToRedirect };

    const userStore = useUserStore();
    vi.spyOn(userStore, 'login').mockResolvedValueOnce();
    vi.spyOn(useUserStore(), 'user', 'get').mockReturnValue({
      id: 1,
      email: 'a@b.c',
      languageId: 1,
      defaultPmsProperty: { id: 2, name: 'prop', image: '' },
      firstName: '',
      lastName: '',
    });

    const inputEmail = screen.getByRole('textbox', { name: 'Username' });
    const inputPassword = screen.getByLabelText('Password');
    const btn = screen.getByRole('button', { name: 'Log in' });

    await fireEvent.update(inputEmail, 'user@example.com');
    await fireEvent.update(inputPassword, 'secret');
    await fireEvent.click(btn);

    await waitFor(() => expect(replace).toHaveBeenCalledWith(routeToRedirect));
  });

  it('redirects to proper pms property id when login has pms property id in the path', async () => {
    route.query = {};
    route.params = { pmsPropertyId: '1' };
    route.fullPath = '/login/1';

    const userStore = useUserStore();
    vi.spyOn(userStore, 'login').mockResolvedValueOnce();
    vi.spyOn(useUserStore(), 'user', 'get').mockReturnValue({
      id: 1,
      email: 'a@b.c',
      languageId: 1,
      defaultPmsProperty: { id: 2, name: 'prop', image: '' },
      firstName: '',
      lastName: '',
    });

    const email = screen.getByRole('textbox', { name: 'Username' });
    const pass = screen.getByLabelText('Password');
    const btn = screen.getByRole('button', { name: 'Log in' });

    await fireEvent.update(email, 'user@example.com');
    await fireEvent.update(pass, 'secret');
    await fireEvent.click(btn);

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/1'));
  });
  it('shows reset password', () => {
    const link = screen.getByRole('link', { name: 'Forgot your password?' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/request-reset-password');
  });

  it('shows instance name', () => {
    expect(screen.getByText('Roomdoo Cloud')).toBeInTheDocument();
  });
});
