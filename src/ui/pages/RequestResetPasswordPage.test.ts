import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/vue';
import { createTestingPinia } from '@pinia/testing';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';

import RequestResetPasswordPage from './RequestResetPasswordPage.vue';

import primevuePlugin from '@/infrastructure/plugins/primevue';

// Mock dependencies
const requestChangePasswordMock = vi.fn();
const addNotificationMock = vi.fn();

vi.mock('@/infrastructure/stores/user', () => ({
  useUserStore: () => ({
    requestChangePassword: requestChangePasswordMock,
  }),
}));

vi.mock('@/infrastructure/stores/notifications', () => ({
  useNotificationsStore: () => ({
    add: addNotificationMock,
  }),
}));

vi.mock('@/infrastructure/stores/instance', () => ({
  useInstanceStore: () => ({
    instance: { image: 'http://example.com/image.jpg' },
  }),
}));

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

describe('RequestResetPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(RequestResetPasswordPage, {
      global: {
        plugins: [createTestingPinia(), primevuePlugin],
        components: {
          Button,
          InputText,
          Message,
        },
        stubs: {
          ArrowLeft: true,
        },
      },
    });
  };

  it('renders the page correctly', () => {
    renderComponent();
    expect(screen.getAllByAltText('Roomdoo Logo')).toHaveLength(2); // One mobile, one desktop/header
    expect(screen.getByText('requestResetPassword.resetPassword')).toBeTruthy();
    expect(screen.getByPlaceholderText('requestResetPassword.email')).toBeTruthy();
    expect(screen.getByText('requestResetPassword.sendRequest')).toBeTruthy();
  });

  it('shows error when email is empty', async () => {
    renderComponent();
    const button = screen.getByText('requestResetPassword.sendRequest');

    await fireEvent.click(button);

    expect(screen.getByText('requestResetPassword.emailRequired')).toBeTruthy();
    expect(requestChangePasswordMock).not.toHaveBeenCalled();
  });

  it('shows error when email format is invalid', async () => {
    renderComponent();
    const emailInput = screen.getByPlaceholderText('requestResetPassword.email');
    const button = screen.getByText('requestResetPassword.sendRequest');

    await fireEvent.update(emailInput, 'invalid-email');
    await fireEvent.click(button);

    expect(screen.getByText('requestResetPassword.wrongEmailFormat')).toBeTruthy();
    expect(requestChangePasswordMock).not.toHaveBeenCalled();
  });

  it('calls requestChangePassword and shows notification when email is valid', async () => {
    renderComponent();
    const emailInput = screen.getByPlaceholderText('requestResetPassword.email');
    const button = screen.getByText('requestResetPassword.sendRequest');
    const validEmail = 'test@example.com';

    await fireEvent.update(emailInput, validEmail);
    await fireEvent.click(button);

    expect(requestChangePasswordMock).toHaveBeenCalledWith(validEmail);
    expect(addNotificationMock).toHaveBeenCalledWith('requestResetPassword.requestSent', 'success');
    // Error message should be gone/not present (if it was there)
    // Using query because it shouldn't exist
    expect(screen.queryByText('requestResetPassword.emailRequired')).toBeNull();
    expect(screen.queryByText('requestResetPassword.wrongEmailFormat')).toBeNull();
  });
});
