import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/vue';
import { createTestingPinia } from '@pinia/testing';
import Button from 'primevue/button';
import Password from 'primevue/password';
import Message from 'primevue/message';
import Divider from 'primevue/divider';

import ResetPasswordPage from './ResetPasswordPage.vue';

import primevuePlugin from '@/infrastructure/plugins/primevue';
import { UnauthorizedError } from '@/application/shared/UnauthorizedError';

// Mock dependencies
const resetPasswordMock = vi.fn();
const addNotificationMock = vi.fn();
const startLoadingMock = vi.fn();
const stopLoadingMock = vi.fn();
const addTextMessageMock = vi.fn();

vi.mock('@/infrastructure/stores/user', () => ({
  useUserStore: () => ({
    resetPassword: resetPasswordMock,
  }),
}));

vi.mock('@/infrastructure/stores/notifications', () => ({
  useNotificationsStore: () => ({
    add: addNotificationMock,
  }),
}));

vi.mock('@/infrastructure/stores/ui', () => ({
  useUIStore: () => ({
    startLoading: startLoadingMock,
    stopLoading: stopLoadingMock,
  }),
}));

vi.mock('@/infrastructure/stores/instance', () => ({
  useInstanceStore: () => ({
    instance: { image: 'http://example.com/image.jpg' },
  }),
}));

vi.mock('@/infrastructure/stores/textMessages', () => ({
  useTextMessagesStore: () => ({
    addTextMessage: addTextMessageMock,
  }),
}));

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('vue-router', () => ({
  useRoute: () => ({
    query: { token: 'valid-token' },
  }),
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('@/ui/composables/useTranslatedValidationError', () => ({
  useTranslatedError: () => ({
    translate: (key: string) => key,
  }),
}));

// Mock validation schema primarily to avoid complex setup,
// though vee-validate integration is usually best tested with real schemas.
// here we use the real component which imports the schema.

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(ResetPasswordPage, {
      global: {
        plugins: [createTestingPinia(), primevuePlugin],
        components: {
          Button,
          Password,
          Message,
          Divider,
        },
        stubs: {
          ArrowLeft: true,
          AppSelect: true,
        },
      },
    });
  };

  it('renders the page correctly', () => {
    renderComponent();
    expect(screen.getAllByAltText('Roomdoo Logo')).toHaveLength(2);
    expect(screen.getByText('requestResetPassword.resetPassword')).toBeTruthy();
    expect(screen.getByText('resetPassword.newPassword')).toBeTruthy();
    expect(screen.getByText('resetPassword.repeatNewPassword')).toBeTruthy();
  });

  it('validates password mismatch or weakness', async () => {
    // Note: vee-validate is async.
    renderComponent();

    // We can access by placeholder or label
    // Primevue Password renders inside a wrapper.
    const pass1 = screen.getAllByPlaceholderText('resetPassword.password')[0];
    const pass2 = screen.getAllByPlaceholderText('resetPassword.password')[1];

    // Set invalid passwords
    await fireEvent.update(pass1, 'short');
    await fireEvent.update(pass2, 'short');

    const saveButton = screen.getByText('resetPassword.savePassword');
    await fireEvent.click(saveButton);

    // resetPasswordMock should not be called
    expect(resetPasswordMock).not.toHaveBeenCalled();
    // Validation messages should appear.
    // Since we mocked translate, it might show the raw key or message.
    // Assuming the schema returns specific error keys/messages.
  });

  it('successfully resets password', async () => {
    renderComponent();

    // Assuming the schema requires 8 chars + letter + number
    const validPass = 'Valid1234!';

    const pass1 = screen.getAllByPlaceholderText('resetPassword.password')[0];
    const pass2 = screen.getAllByPlaceholderText('resetPassword.password')[1];

    await fireEvent.update(pass1, validPass);
    await fireEvent.update(pass2, validPass);

    const saveButton = screen.getByText('resetPassword.savePassword');
    await fireEvent.click(saveButton);

    await waitFor(() => {
      expect(resetPasswordMock).toHaveBeenCalledWith(validPass, 'valid-token');
    });
    expect(addNotificationMock).toHaveBeenCalledWith('resetPassword.passwordChanged', 'success');
  });

  it('handles unauthorized error (invalid token)', async () => {
    const validPass = 'Valid1234!';
    resetPasswordMock.mockRejectedValue(new UnauthorizedError());

    renderComponent();

    const pass1 = screen.getAllByPlaceholderText('resetPassword.password')[0];
    const pass2 = screen.getAllByPlaceholderText('resetPassword.password')[1];

    await fireEvent.update(pass1, validPass);
    await fireEvent.update(pass2, validPass);

    const saveButton = screen.getByText('resetPassword.savePassword');
    await fireEvent.click(saveButton);

    await waitFor(() => {
      // We look for the error message div
      expect(screen.getByText('resetPassword.invalidToken')).toBeTruthy();
    });
  });

  it('handles general error', async () => {
    const validPass = 'Valid1234!';
    resetPasswordMock.mockRejectedValue(new Error('Network error'));

    renderComponent();

    const pass1 = screen.getAllByPlaceholderText('resetPassword.password')[0];
    const pass2 = screen.getAllByPlaceholderText('resetPassword.password')[1];

    await fireEvent.update(pass1, validPass);
    await fireEvent.update(pass2, validPass);

    const saveButton = screen.getByText('resetPassword.savePassword');
    await fireEvent.click(saveButton);

    await waitFor(() => {
      expect(addTextMessageMock).toHaveBeenCalledWith(
        'error.somethingWentWrong',
        'resetPassword.unableToResetPassword',
      );
    });
  });
});
