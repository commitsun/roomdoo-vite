import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/vue';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import { waitFor } from '@testing-library/vue';

import { createTestingPinia } from '@pinia/testing';
import primevuePlugin from '@/infrastructure/plugins/primevue';

import Avatar from 'primevue/avatar';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import Password from 'primevue/password';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import Message from 'primevue/message';

import UserSettings from './UserSettings.vue';

vi.mock('vue-i18n', () => {
  const t: Record<string, string> = {
    'userSettings.userData': 'User data',
    'userSettings.changePassword': 'Change password',
    'userSettings.replaceImage': 'Replace image',
    'userSettings.removeImage': 'Remove image',
    'userSettings.firstName': 'First name',
    'userSettings.lastName': 'Last name',
    'userSettings.secondLastName': 'Second last name',
    'userSettings.phone': 'Phone',
    'userSettings.email': 'Email',
    'userSettings.language': 'Language',
    'userSettings.cancel': 'Cancel',
    'userSettings.save': 'Save',
    'userSettings.currentPassword': 'Current password',
    'userSettings.newPassword': 'New password',
    'userSettings.repeatPassword': 'Repeat password',
    'userSettings.invalidPassword': 'Invalid password',
    'userSettings.passwordsDoNotMatch': 'Passwords do not match',
    'userSettings.passwordChanged': 'Password changed',
    'error.somethingWentWrong': 'Something went wrong',
    'error.unknownError': 'Unknown error',
  };
  return {
    useI18n: () => ({ t: (k: string) => t[k] ?? k }),
    createI18n: vi.fn(() => ({ global, install: () => {} })),
  };
});

vi.mock('@/application/shared/UnauthorizedError', () => {
  class UnauthorizedError extends Error {}
  return { UnauthorizedError };
});

const userMock = {
  firstName: 'John',
  lastName: 'Doe',
  lastName2: 'Roe',
  phone: '111-222',
  email: 'john@example.com',
  lang: 'en_US',
};

const updateUser = vi.fn().mockResolvedValue(undefined);
const changePassword = vi.fn().mockResolvedValue(undefined);

vi.mock('@/infrastructure/stores/user', () => ({
  useUserStore: () => ({
    user: userMock,
    updateUser,
    changePassword,
  }),
}));

const instanceMock = {
  languages: [
    { code: 'en-US', name: 'English (US)' },
    { code: 'es-ES', name: 'Español (ES)' },
  ],
};
vi.mock('@/infrastructure/stores/instance', () => ({
  useInstanceStore: () => ({ instance: instanceMock }),
}));

const startLoading = vi.fn();
const stopLoading = vi.fn();
vi.mock('@/infrastructure/stores/ui', () => ({
  useUIStore: () => ({ startLoading, stopLoading }),
}));

const addTextMessage = vi.fn();
vi.mock('@/infrastructure/stores/textMessages', () => ({
  useTextMessagesStore: () => ({ addTextMessage }),
}));

const notifyAdd = vi.fn();
vi.mock('@/infrastructure/stores/notifications', () => ({
  useNotificationsStore: () => ({ add: notifyAdd }),
}));
class RO {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(globalThis as any).ResizeObserver = RO;

describe('UserSettings.vue', () => {
  let dialogClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    dialogClose = vi.fn();

    const pinia = createTestingPinia();
    render(UserSettings, {
      global: {
        plugins: [pinia, [primevuePlugin, { ripple: false }]],
        provide: {
          dialogRef: { value: { close: dialogClose } },
        },
        components: {
          Avatar,
          Button,
          InputText,
          Select,
          IconField,
          InputIcon,
          Password,
          Tabs,
          TabList,
          Tab,
          TabPanels,
          TabPanel,
          Message,
        },
      },
    });
  });

  it('render user data form', async () => {
    expect(screen.getByText(/user data/i)).toBeInTheDocument();
    expect(screen.getByText(/change password/i)).toBeInTheDocument();
    const firstName = screen.getByRole('textbox', { name: /first name/i });
    const lastName = screen.getByRole('textbox', { name: 'Last name' });
    const secondLastName = screen.getByRole('textbox', { name: 'Second last name' });
    const email = screen.getByRole('textbox', { name: /email/i });
    const phone = screen.getByRole('textbox', { name: /phone/i });
    const language = screen.getByRole('combobox', { name: /language/i });
    expect(firstName).toHaveValue('John');
    expect(lastName).toHaveValue('Doe');
    expect(email).toHaveValue('john@example.com');
    expect(secondLastName).toHaveValue('Roe');
    expect(phone).toHaveValue('111-222');

    expect(language).toBeInTheDocument();
  });
  it('clicking Save in the data tab, it calls updateUser, shows a notification, and closes', async () => {
    const firstName = screen.getByRole('textbox', { name: /first name/i });
    const phone = screen.getByRole('textbox', { name: /phone/i });

    await userEvent.clear(firstName);
    await userEvent.type(firstName, 'Jane');
    await userEvent.clear(phone);
    await userEvent.type(phone, '999-888');

    const saveBtn = screen.getByRole('button', { name: /save/i });
    await userEvent.click(saveBtn);

    expect(startLoading).toHaveBeenCalled();

    await waitFor(() => {
      expect(updateUser).toHaveBeenCalledWith({
        firstName: 'Jane',
        lastName: 'Doe',
        lastName2: 'Roe',
        phone: '999-888',
        email: 'john@example.com',
        lang: 'en-US',
      });
      expect(notifyAdd).toHaveBeenCalledWith('userSettings.userUpdated', 'success');
      expect(dialogClose).toHaveBeenCalledWith({ action: 'userUpdated' });
      expect(stopLoading).toHaveBeenCalled();
    });
  });

  it('if updateUser fails, it shows an error notification and calls stopLoading', async () => {
    (updateUser as any).mockRejectedValueOnce(new Error('boom'));

    const saveBtn = screen.getByRole('button', { name: /save/i });
    await userEvent.click(saveBtn);

    expect(startLoading).toHaveBeenCalled();

    await waitFor(() => {
      expect(notifyAdd).toHaveBeenCalledWith(expect.stringMatching(/unknown error/i), 'error');
      expect(stopLoading).toHaveBeenCalled();
      expect(dialogClose).not.toHaveBeenCalled();
    });
  });

  it('change password tab: the Save button is disabled until all three fields are filled', async () => {
    await userEvent.click(screen.getByText(/change password/i));

    const saveBtn = screen.getAllByRole('button', { name: /save/i }).at(-1)!;
    expect(saveBtn).toBeDisabled();

    const current = screen.getByLabelText(/current password/i, { selector: 'input' });
    const neo = screen.getByLabelText(/new password/i, { selector: 'input' });
    const repeat = screen.getByLabelText(/repeat password/i, { selector: 'input' });

    await userEvent.type(current, 'old!');
    await userEvent.type(neo, 'new!');
    await userEvent.type(repeat, 'new!');

    expect(saveBtn).not.toBeDisabled();
  });

  it('shows an error if passwords do not match and does NOT call changePassword', async () => {
    await userEvent.click(screen.getByText(/change password/i));
    const current = screen.getByLabelText(/current password/i, { selector: 'input' });
    const neo = screen.getByLabelText(/new password/i, { selector: 'input' });
    const repeat = screen.getByLabelText(/repeat password/i, { selector: 'input' });

    await userEvent.type(current, 'old!');
    await userEvent.type(neo, 'new-1');
    await userEvent.type(repeat, 'new-2');

    const saveBtn = screen.getAllByRole('button', { name: /save/i }).at(-1)!;
    await userEvent.click(saveBtn);

    expect(screen.getByText(/passwords do not match/i)).toBeVisible();
    expect(changePassword).not.toHaveBeenCalled();
    expect(startLoading).not.toHaveBeenCalled();
  });

  it('if changePassword returns UnauthorizedError, shows "Invalid password"', async () => {
    await userEvent.click(screen.getByText(/change password/i));

    const { UnauthorizedError } = await import('@/application/shared/UnauthorizedError');
    (changePassword as any).mockRejectedValueOnce(new UnauthorizedError('nope'));

    const current = screen.getByLabelText(/current password/i, { selector: 'input' });
    const neo = screen.getByLabelText(/new password/i, { selector: 'input' });
    const repeat = screen.getByLabelText(/repeat password/i, { selector: 'input' });

    await userEvent.type(current, 'old!');
    await userEvent.type(neo, 'new!');
    await userEvent.type(repeat, 'new!');

    const saveBtn = screen.getAllByRole('button', { name: /save/i }).at(-1)!;
    await userEvent.click(saveBtn);

    expect(startLoading).toHaveBeenCalled();
    expect(screen.getByText(/invalid password/i)).toBeVisible();
    expect(stopLoading).toHaveBeenCalled();
    expect(dialogClose).not.toHaveBeenCalled();
  });

  it('if changePassword is successful, it shows a notification and closes the dialog', async () => {
    await userEvent.click(screen.getByText(/change password/i));

    (changePassword as any).mockResolvedValueOnce(undefined);

    const current = screen.getByLabelText(/current password/i, { selector: 'input' });
    const neo = screen.getByLabelText(/new password/i, { selector: 'input' });
    const repeat = screen.getByLabelText(/repeat password/i, { selector: 'input' });

    await userEvent.type(current, 'old!');
    await userEvent.type(neo, 'new!');
    await userEvent.type(repeat, 'new!');

    const saveBtn = screen.getAllByRole('button', { name: /save/i }).at(-1)!;
    await userEvent.click(saveBtn);

    expect(changePassword).toHaveBeenCalledWith('old!', 'new!');
    expect(notifyAdd).toHaveBeenCalledWith('Password changed', 'success');
    expect(dialogClose).toHaveBeenCalledWith({ action: 'passwordChanged' });
    expect(stopLoading).toHaveBeenCalled();
  });

  it('if changePassword throws a generic error, it shows "Unknown error", does not notify, and does not close', async () => {
    await userEvent.click(screen.getByText(/change password/i));

    (changePassword as any).mockRejectedValueOnce(new Error('random-fail'));

    const current = screen.getByLabelText(/current password/i, { selector: 'input' });
    const neo = screen.getByLabelText(/new password/i, { selector: 'input' });
    const repeat = screen.getByLabelText(/repeat password/i, { selector: 'input' });

    await userEvent.type(current, 'old!');
    await userEvent.type(neo, 'new!');
    await userEvent.type(repeat, 'new!');

    const saveBtn = screen.getAllByRole('button', { name: /save/i }).at(-1)!;
    await userEvent.click(saveBtn);

    expect(startLoading).toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getByText(/unknown error/i)).toBeVisible();

      expect(dialogClose).not.toHaveBeenCalled();
      expect(notifyAdd).not.toHaveBeenCalled();

      expect(stopLoading).toHaveBeenCalled();
    });
  });

  it('if Cancel is clicked, it closes the dialog', async () => {
    const cancelBtn = screen.getAllByRole('button', { name: /cancel/i }).at(0)!;
    await userEvent.click(cancelBtn);
    expect(dialogClose).toHaveBeenCalledWith({ action: 'cancel' });
  });
});
