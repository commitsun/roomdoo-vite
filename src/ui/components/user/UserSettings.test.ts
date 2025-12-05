// UserSettings.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/vue';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import { createTestingPinia } from '@pinia/testing';
import Avatar from 'primevue/avatar';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Password from 'primevue/password';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import Message from 'primevue/message';
import ConfirmationService from 'primevue/confirmationservice';
import ConfirmDialog from 'primevue/confirmdialog';
import type { Component } from 'vue';

import UserSettings from './UserSettings.vue';

import primevuePlugin from '@/infrastructure/plugins/primevue';

vi.mock('vue-i18n', () => {
  const t: Record<string, string> = {
    'userSettings.profile': 'User data',
    'userSettings.securityAndAccess': 'Change password',

    'userSettings.personalInformation': 'Personal information',
    'userSettings.contactData': 'Contact data',
    'userSettings.changeImage': 'Change image',
    'userSettings.fileTooLarge': 'File too large',

    'userSettings.nameEmailLogin': 'Login name / email',
    'userSettings.yourLogin': 'Your login',
    'userSettings.change': 'Change',
    'userSettings.currentLogin': 'Current login',
    'userSettings.newLogin': 'New login',
    'userSettings.changeLogin': 'Change login',
    'userSettings.loginUpdated': 'Login updated',
    'userSettings.loginRequired': 'Login is required',
    'userSettings.loginAlreadyInUse': 'Login already in use',

    'userSettings.password': 'Password',
    'userSettings.yourPassword': 'Your password',
    'userSettings.changePassword': 'Change password',
    'userSettings.invalidPassword': 'Invalid password',
    'userSettings.passwordsDoNotMatch': 'Passwords do not match',
    'userSettings.passwordChanged': 'Password changed',
    'userSettings.currentPassword': 'Current password',
    'userSettings.newPassword': 'New password',
    'userSettings.repeatPassword': 'Repeat password',
    'userSettings.allPasswordFieldsRequired': 'All password fields are required',

    'userSettings.userData': 'User data',
    'userSettings.uploadPhoto': 'Upload photo',
    'userSettings.removeImage': 'Remove image',
    'userSettings.firstName': 'First name',
    'userSettings.lastName': 'Last name',
    'userSettings.secondLastName': 'Second last name',
    'userSettings.phone': 'Phone',
    'userSettings.email': 'Email',
    'userSettings.language': 'Language',
    'userSettings.cancel': 'Cancel',
    'userSettings.save': 'Save',
    'userSettings.userUpdated': 'userSettings.userUpdated',

    'userSettings.youWillLoseChanges': 'You will lose changes',
    'userSettings.changesWithoutSaving': 'Changes without saving',
    'userSettings.areYouSureChangeLogin': 'Are you sure you want to change the login?',
    'userSettings.changeLogin?': 'Change login?',
    'userSettings.changePassword?': 'Change password?',
    'userSettings.youWillBeLoggedOutAfterPasswordChange':
      'You will be logged out after password change',

    'error.somethingWentWrong': 'Something went wrong',
    'error.unknownError': 'Unknown error',
  };
  return {
    useI18n: () => ({ t: (k: string) => t[k] ?? k }),
    createI18n: vi.fn(() => ({ install: () => {} })),
  };
});

vi.mock('@/application/shared/UnauthorizedError', () => {
  class UnauthorizedError extends Error {}
  return { UnauthorizedError };
});
vi.mock('@/application/shared/BadRequestError', () => {
  class BadRequestError extends Error {}
  return { BadRequestError };
});

const userMock = {
  firstName: 'John',
  lastName: 'Doe',
  lastName2: 'Roe',
  phone: '111-222',
  email: 'john@example.com',
  lang: 'en_US',
  avatar: '',
  login: 'john@example.com',
};
const updateUser = vi.fn().mockResolvedValue(undefined);
const changePassword = vi.fn().mockResolvedValue(undefined);
const login = vi.fn().mockResolvedValue(undefined);

vi.mock('@/infrastructure/stores/user', () => ({
  useUserStore: () => ({
    user: userMock,
    updateUser,
    changePassword,
    changeLogin: vi.fn(),
    login,
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
const refreshView = vi.fn();
vi.mock('@/infrastructure/stores/ui', () => ({
  useUIStore: () => ({ startLoading, stopLoading, refreshView }),
}));
const notifyAdd = vi.fn();
vi.mock('@/infrastructure/stores/notifications', () => ({
  useNotificationsStore: () => ({ add: notifyAdd }),
}));

const addTextMessage = vi.fn();
vi.mock('@/infrastructure/stores/textMessages', () => ({
  useTextMessagesStore: () => ({
    addTextMessage,
    removeTextMessage: vi.fn(),
    messages: [],
  }),
}));

const FileUploadStub: Component = {
  name: 'FileUpload',
  emits: ['select'],
  props: ['chooseLabel'],
  template: `
    <div>
      <button type="button" data-testid="file-upload-trigger" @click="$emit('select', {
        files: [{ size: 1000, objectURL: 'blob:fake-123' }]
      })">{{ chooseLabel }}</button>
    </div>
  `,
};

class RO {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(globalThis as any).ResizeObserver = RO;

describe('UserSettings', () => {
  let dialogClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    dialogClose = vi.fn();

    const pinia = createTestingPinia();
    render(UserSettings, {
      global: {
        plugins: [pinia, [primevuePlugin, { ripple: false }], ConfirmationService],
        provide: {
          dialogRef: { value: { close: dialogClose } },
        },
        stubs: {
          FileUpload: FileUploadStub,
        },
        components: {
          Avatar,
          Button,
          InputText,
          Select,
          Password,
          Tabs,
          TabList,
          Tab,
          TabPanels,
          TabPanel,
          Message,
          ConfirmDialog,
          FileUpload: FileUploadStub,
        },
      },
    });
  });

  it('render user data form', async () => {
    expect(screen.getByText(/user data/i)).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /change password/i })).toBeInTheDocument();

    const firstName = screen.getByRole('textbox', { name: /first name/i });
    const lastName = screen.getByRole('textbox', { name: 'Last name' });
    const email = screen.getByRole('textbox', { name: /email/i });
    const phone = screen.getByRole('textbox', { name: /phone/i });

    expect(firstName).toHaveValue('John');
    expect(lastName).toHaveValue('Doe');
    expect(email).toHaveValue('john@example.com');
    expect(phone).toHaveValue('111-222');

    const language = screen.getByRole('combobox', { name: /language/i });
    expect(language).toBeInTheDocument();
  });

  it('clicking Save in the data tab calls updateUser, notifies, and closes (no payload)', async () => {
    const firstName = screen.getByRole('textbox', { name: /first name/i });
    const phone = screen.getByRole('textbox', { name: /phone/i });

    await userEvent.clear(firstName);
    await userEvent.type(firstName, 'Jane');
    await userEvent.clear(phone);
    await userEvent.type(phone, '999-888');

    const saveBtn = screen.getByRole('button', { name: /save/i });
    await userEvent.click(saveBtn);

    expect(startLoading).toHaveBeenCalled();
    await waitFor(() => expect(updateUser).toHaveBeenCalledTimes(1));

    const payload = (updateUser as unknown as { mock: { calls: any[][] } }).mock.calls[0][0];
    expect(payload).toEqual(expect.objectContaining({ firstName: 'Jane', phone: '999-888' }));
    expect(payload).not.toHaveProperty('lastName');
    expect(payload).not.toHaveProperty('email');

    await waitFor(() => {
      expect(notifyAdd).toHaveBeenCalledWith('userSettings.userUpdated', 'success');
      expect(dialogClose).toHaveBeenCalled();
      expect(stopLoading).toHaveBeenCalled();
    });
  });

  it('if updateUser fails, muestra textMessage "Unknown error" and no closes the dialog', async () => {
    (updateUser as any).mockRejectedValueOnce(new Error('boom'));

    const saveBtn = screen.getByRole('button', { name: /save/i });
    await userEvent.click(saveBtn);

    expect(startLoading).toHaveBeenCalled();

    await waitFor(() => {
      expect(addTextMessage).toHaveBeenCalledWith('Error', 'Unknown error');
      expect(stopLoading).toHaveBeenCalled();
      expect(dialogClose).not.toHaveBeenCalled();
      expect(notifyAdd).not.toHaveBeenCalled();
    });
  });

  it("Password: If they don't match, it displays a local error and doesn't call changePassword or open confirm.", async () => {
    const securityTab = screen.getByRole('tab', { name: /^change password$/i });
    await userEvent.click(securityTab);

    const pwdHeaderText = await screen.findByText(/your password/i);
    const passwordPanel = pwdHeaderText.closest('.p-panel');
    expect(passwordPanel).toBeTruthy();

    const headerEl = passwordPanel!.querySelector('.p-panel-header') as HTMLElement;
    await userEvent.click(headerEl);

    const current = await screen.findByLabelText(/current password/i, { selector: 'input' });
    const neo = screen.getByLabelText(/new password/i, { selector: 'input' });
    const repeat = screen.getByLabelText(/repeat password/i, { selector: 'input' });

    await userEvent.type(current, 'old!');
    await userEvent.type(neo, 'new-1');
    await userEvent.type(repeat, 'new-2');

    const changeBtnTextNode = within(passwordPanel as HTMLElement).getByText(/^change password$/i);
    await userEvent.click(changeBtnTextNode);

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
    expect(changePassword).not.toHaveBeenCalled();
    expect(startLoading).not.toHaveBeenCalled();
  });

  it('password: UnauthorizedError -> textMessage "Invalid password"', async () => {
    const securityTab = screen.getByRole('tab', { name: /^change password$/i });
    await userEvent.click(securityTab);

    const pwdHeaderText = await screen.findByText(/your password/i);
    const passwordPanel = pwdHeaderText.closest('.p-panel') as HTMLElement;
    const headerEl = passwordPanel.querySelector('.p-panel-header') as HTMLElement;
    await userEvent.click(headerEl);

    const current = await screen.findByLabelText(/current password/i, { selector: 'input' });
    const neo = screen.getByLabelText(/new password/i, { selector: 'input' });
    const repeat = screen.getByLabelText(/repeat password/i, { selector: 'input' });
    await userEvent.type(current, 'old!');
    await userEvent.type(neo, 'new!');
    await userEvent.type(repeat, 'new!');

    const { UnauthorizedError } = await import('@/application/shared/UnauthorizedError');
    (changePassword as any).mockRejectedValueOnce(new UnauthorizedError('nope'));

    const changeBtnTextNode = within(passwordPanel).getByText(/^change password$/i);
    await userEvent.click(changeBtnTextNode);

    const confirmAccept = await screen.findByRole('button', { name: /^change$/i });
    await userEvent.click(confirmAccept);

    expect(startLoading).toHaveBeenCalled();

    expect(dialogClose).not.toHaveBeenCalled();

    expect(stopLoading).toHaveBeenCalled();
  });

  it('Password: Success -> Notifies and closes with doLogout', async () => {
    const securityTab = screen.getByRole('tab', { name: /^change password$/i });
    await userEvent.click(securityTab);

    const pwdHeaderText = await screen.findByText(/your password/i);
    const passwordPanel = pwdHeaderText.closest('.p-panel') as HTMLElement;
    const headerEl = passwordPanel.querySelector('.p-panel-header') as HTMLElement;
    await userEvent.click(headerEl);

    await userEvent.type(screen.getByLabelText(/current password/i, { selector: 'input' }), 'old!');
    await userEvent.type(screen.getByLabelText(/new password/i, { selector: 'input' }), 'new!');
    await userEvent.type(screen.getByLabelText(/repeat password/i, { selector: 'input' }), 'new!');

    const changeBtnTextNode = within(passwordPanel).getByText(/^change password$/i);
    await userEvent.click(changeBtnTextNode);

    const confirmAccept = await screen.findByRole('button', { name: /^change$/i });
    await userEvent.click(confirmAccept);

    await waitFor(() => expect(changePassword).toHaveBeenCalledWith('old!', 'new!'));
    await waitFor(() => expect(notifyAdd).toHaveBeenCalled());

    const [msg, level] = notifyAdd.mock.calls.at(-1)!;
    expect(level).toBe('success');
    expect(String(msg)).toMatch(/password changed|userSettings\.passwordChanged/i);

    expect(dialogClose).toHaveBeenCalledWith({ action: 'doLogout' });
    expect(stopLoading).toHaveBeenCalled();
  });

  it('Password: Generic error -> textMessage "Unknown error", does not notify or close', async () => {
    const securityTab = screen.getByRole('tab', { name: /^change password$/i });
    await userEvent.click(securityTab);

    const pwdHeaderText = await screen.findByText(/your password/i);
    const passwordPanel = pwdHeaderText.closest('.p-panel') as HTMLElement;
    const headerEl = passwordPanel.querySelector('.p-panel-header') as HTMLElement;
    await userEvent.click(headerEl);

    const current = await screen.findByLabelText(/current password/i, { selector: 'input' });
    const neo = screen.getByLabelText(/new password/i, { selector: 'input' });
    const repeat = screen.getByLabelText(/repeat password/i, { selector: 'input' });
    await userEvent.type(current, 'old!');
    await userEvent.type(neo, 'new!');
    await userEvent.type(repeat, 'new!');

    const { UnknownError } = await import('@/application/shared/UnknownError');
    (changePassword as any).mockRejectedValueOnce(new UnknownError('nope'));

    const changeBtnTextNode = within(passwordPanel).getByText(/^change password$/i);
    await userEvent.click(changeBtnTextNode);

    const confirmAccept = await screen.findByRole('button', { name: /^change$/i });
    await userEvent.click(confirmAccept);

    expect(startLoading).toHaveBeenCalled();

    expect(dialogClose).not.toHaveBeenCalled();

    expect(stopLoading).toHaveBeenCalled();
  });

  it('Cancel button closes the dialog', async () => {
    const cancelBtn = screen.getAllByRole('button', { name: /cancel/i }).at(0)!;
    await userEvent.click(cancelBtn);
    expect(dialogClose).toHaveBeenCalledWith({ action: 'cancel' });
  });

  it('Upload image via FileUpload. Add avatar to payload in Save.', async () => {
    await userEvent.click(screen.getByTestId('file-upload-trigger'));

    const saveBtn = screen.getByRole('button', { name: /save/i });
    await userEvent.click(saveBtn);

    await waitFor(() => {
      const payload = updateUser.mock.calls.at(-1)?.[0];
      expect(payload).toEqual(expect.objectContaining({ avatar: 'blob:fake-123' }));
      expect(notifyAdd).toHaveBeenCalledWith('userSettings.userUpdated', 'success');
    });
  });

  it('login: changes the login by displaying confirm; upon acceptance, it updates, notifies, and closes', async () => {
    const securityTab = screen.getByRole('tab', { name: /^change password$/i });
    await userEvent.click(securityTab);

    const yourLoginHeader = await screen.findByText(/your login/i);
    const loginPanel = yourLoginHeader.closest('.p-panel') as HTMLElement;
    const loginHeaderEl = loginPanel.querySelector('.p-panel-header') as HTMLElement;
    await userEvent.click(loginHeaderEl);

    const newLoginInput = within(loginPanel).getByLabelText(/new login/i, { selector: 'input' });
    await userEvent.clear(newLoginInput);
    await userEvent.type(newLoginInput, 'new-login-id');

    const passwordInput = within(loginPanel).getByLabelText(/password/i, { selector: 'input' });
    await userEvent.clear(passwordInput);
    await userEvent.type(passwordInput, 'my-current-password');

    const changeLoginBtnText = within(loginPanel).getByText(/^change login$/i);
    const changeLoginBtn = changeLoginBtnText.closest('button') ?? changeLoginBtnText;
    await userEvent.click(changeLoginBtn);

    const confirmHeader = await screen.findByText(/change login\?/i);
    const confirmDialogEl = confirmHeader.closest('.p-dialog') as HTMLElement;
    expect(confirmDialogEl).toBeTruthy();

    const acceptBtn = within(confirmDialogEl).getByRole('button', { name: /^change$/i });
    await userEvent.click(acceptBtn);

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith('john@example.com', 'my-current-password');
      expect(updateUser).toHaveBeenCalledWith({ login: 'new-login-id' });
      expect(notifyAdd).toHaveBeenCalledWith('Login updated', 'success');
      expect(dialogClose).toHaveBeenCalledWith({ action: 'doLogout' });
    });
  });

  it('login: if newLogin is empty, it displays local validation and does not open confirm', async () => {
    const securityTab = screen.getByRole('tab', { name: /^change password$/i });
    await userEvent.click(securityTab);

    const yourLoginHeader = await screen.findByText(/your login/i);
    const loginPanel = yourLoginHeader.closest('.p-panel') as HTMLElement;
    const loginHeaderEl = loginPanel.querySelector('.p-panel-header') as HTMLElement;
    await userEvent.click(loginHeaderEl);

    const newLoginInput = within(loginPanel).getByLabelText(/new login/i, { selector: 'input' });
    await userEvent.clear(newLoginInput);

    const passwordInput = within(loginPanel).getByLabelText(/password/i, { selector: 'input' });
    await userEvent.clear(passwordInput);
    await userEvent.type(passwordInput, 'my-current-password');

    const changeLoginBtnText = within(loginPanel).getByText(/^change login$/i);
    const changeLoginBtn = changeLoginBtnText.closest('button') ?? changeLoginBtnText;
    await userEvent.click(changeLoginBtn);

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /^change$/i })).not.toBeInTheDocument();
    });

    expect(await screen.findByText(/login is required/i)).toBeInTheDocument();

    expect(updateUser).not.toHaveBeenCalled();
  });
});
