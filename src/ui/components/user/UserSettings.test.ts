// UserSettings.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within, fireEvent } from '@testing-library/vue';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import { createTestingPinia } from '@pinia/testing';
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

    'userSettings.password': 'Password',
    'userSettings.yourPassword': 'Your password',
    'userSettings.changePassword': 'Change password',
    'userSettings.invalidPassword': 'Invalid password',
    'userSettings.passwordsDoNotMatch': 'Passwords do not match',
    'userSettings.passwordChanged': 'Password changed',
    'userSettings.currentPassword': 'Current password',
    'userSettings.newPassword': 'New password',
    'userSettings.repeatPassword': 'Repeat password',

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

// ---------- Instance store mock ----------
const instanceMock = {
  languages: [
    { code: 'en-US', name: 'English (US)' },
    { code: 'es-ES', name: 'Español (ES)' },
  ],
};
vi.mock('@/infrastructure/stores/instance', () => ({
  useInstanceStore: () => ({ instance: instanceMock }),
}));

// ---------- UI & notifications stores ----------
const startLoading = vi.fn();
const stopLoading = vi.fn();
vi.mock('@/infrastructure/stores/ui', () => ({
  useUIStore: () => ({ startLoading, stopLoading }),
}));
const notifyAdd = vi.fn();
vi.mock('@/infrastructure/stores/notifications', () => ({
  useNotificationsStore: () => ({ add: notifyAdd }),
}));

// ---------- FileUpload stub (simple) ----------
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

// ---------- ResizeObserver stub ----------
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
          FileUpload: FileUploadStub,
        },
      },
    });
  });

  it('render user data form', async () => {
    expect(screen.getByText(/user data/i)).toBeInTheDocument();
    expect(screen.getByText(/change password/i)).toBeInTheDocument();

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

    await waitFor(() => expect(updateUser).toHaveBeenCalledTimes(1));

    const payload = (updateUser as unknown as { mock: { calls: any[][] } }).mock.calls[0][0];

    expect(payload).toEqual(
      expect.objectContaining({
        firstName: 'Jane',
        phone: '999-888',
      }),
    );

    expect(payload).not.toHaveProperty('lastName');
    expect(payload).not.toHaveProperty('email');
    expect(payload).not.toHaveProperty('lang');

    await waitFor(() => {
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

  it('shows an error if passwords do not match and does NOT call changePassword', async () => {
    const tabs = screen.queryAllByRole('tab');
    if (tabs.length >= 2) {
      await userEvent.click(tabs[1]);
    } else {
      const securityTab = screen.getByText(
        (_, el) =>
          el !== null &&
          typeof el.textContent === 'string' &&
          /security\s+and\s+access/i.test(el.textContent),
      );
      await userEvent.click(securityTab);
    }

    const pwdHeader = screen.getAllByText(
      (_, el) =>
        el !== null &&
        typeof el.textContent === 'string' &&
        /^\s*password\s*$/i.test(el.textContent),
    )[0];

    const sectionEl = pwdHeader.closest('.user__settings--security-section');
    expect(sectionEl).not.toBeNull();

    if (!(sectionEl instanceof HTMLElement)) {
      throw new Error('Password section is not an HTMLElement');
    }

    await userEvent.click(within(sectionEl).getByText(/^change$/i));

    await waitFor(() => {
      expect(screen.getByLabelText(/current password/i, { selector: 'input' })).toBeInTheDocument();
    });

    const current = screen.getByLabelText(/current password/i, { selector: 'input' });
    const neo = screen.getByLabelText(/new password/i, { selector: 'input' });
    const repeat = screen.getByLabelText(/repeat password/i, { selector: 'input' });

    await userEvent.type(current, 'old!');
    await userEvent.type(neo, 'new-1');
    await userEvent.type(repeat, 'new-2');

    const changeBtn = screen.getByRole('button', { name: /change password/i });
    await userEvent.click(changeBtn);

    expect(screen.getByText(/passwords do not match/i)).toBeVisible();
    expect(changePassword).not.toHaveBeenCalled();
    expect(startLoading).not.toHaveBeenCalled();
  });

  it('if changePassword returns UnauthorizedError, shows "Invalid password"', async () => {
    const tabs = screen.getAllByRole('tab');
    await userEvent.click(tabs[1]);

    const pwdHeader = screen.getAllByText(
      (_, el) => el !== null && /^\s*password\s*$/i.test(el.textContent ?? ''),
    )[0];

    const sectionEl = pwdHeader.closest('.user__settings--security-section');
    expect(sectionEl).not.toBeNull();
    if (!(sectionEl instanceof HTMLElement)) {
      throw new Error('Expected HTMLElement');
    }

    await userEvent.click(within(sectionEl).getByText(/^change$/i));

    await waitFor(() => {
      expect(screen.getByLabelText(/current password/i, { selector: 'input' })).toBeInTheDocument();
    });

    const { UnauthorizedError } = await import('@/application/shared/UnauthorizedError');
    (changePassword as any).mockRejectedValueOnce(new UnauthorizedError('nope'));

    const current = screen.getByLabelText(/current password/i, { selector: 'input' });
    const neo = screen.getByLabelText(/new password/i, { selector: 'input' });
    const repeat = screen.getByLabelText(/repeat password/i, { selector: 'input' });

    await userEvent.type(current, 'old!');
    await userEvent.type(neo, 'new!');
    await userEvent.type(repeat, 'new!');

    const changeBtn = screen.getByRole('button', { name: /change password/i });
    await userEvent.click(changeBtn);

    expect(startLoading).toHaveBeenCalled();
    expect(screen.getByText(/invalid password/i)).toBeVisible();
    expect(stopLoading).toHaveBeenCalled();
    expect(dialogClose).not.toHaveBeenCalled();
  });
  it('if changePassword is successful, it shows a notification and closes the dialog', async () => {
    const tabs = screen.getAllByRole('tab');
    await userEvent.click(tabs[1]);

    const pwdHeader = screen.getAllByText(
      (_, el) =>
        el !== null &&
        typeof el.textContent === 'string' &&
        /^\s*password\s*$/i.test(el.textContent),
    )[0];
    const sectionEl = pwdHeader.closest('.user__settings--security-section') as HTMLElement;
    await userEvent.click(within(sectionEl).getByText(/^change$/i));

    await screen.findByLabelText(/current password/i, { selector: 'input' });

    (changePassword as any).mockResolvedValueOnce(undefined);

    await userEvent.type(screen.getByLabelText(/current password/i, { selector: 'input' }), 'old!');
    await userEvent.type(screen.getByLabelText(/new password/i, { selector: 'input' }), 'new!');
    await userEvent.type(screen.getByLabelText(/repeat password/i, { selector: 'input' }), 'new!');
    await userEvent.click(screen.getByRole('button', { name: /change password/i }));

    await waitFor(() => expect(notifyAdd).toHaveBeenCalled());

    const [msg, level] = notifyAdd.mock.calls.at(-1)!;
    expect(level).toBe('success');
    expect(String(msg)).toMatch(/password changed|userSettings\.passwordChanged/i);

    expect(changePassword).toHaveBeenCalledWith('old!', 'new!');
    expect(dialogClose).toHaveBeenCalledWith({ action: 'doLogout' });
    expect(stopLoading).toHaveBeenCalled();
  });

  it('if changePassword throws a generic error, it shows "Unknown error", does not notify, and does not close', async () => {
    const tabs = screen.getAllByRole('tab');
    await userEvent.click(tabs[1]);

    const pwdHeader = screen.getAllByText(
      (_, el) => el !== null && /^\s*password\s*$/i.test(el.textContent ?? ''),
    )[0];

    const sectionEl = pwdHeader.closest('.user__settings--security-section');
    expect(sectionEl).not.toBeNull();
    if (!(sectionEl instanceof HTMLElement)) {
      throw new Error('Expected HTMLElement');
    }

    await userEvent.click(within(sectionEl).getByText(/^change$/i));

    (changePassword as any).mockRejectedValueOnce(new Error('random-fail'));

    const current = screen.getByLabelText(/current password/i, { selector: 'input' });
    const neo = screen.getByLabelText(/new password/i, { selector: 'input' });
    const repeat = screen.getByLabelText(/repeat password/i, { selector: 'input' });

    await userEvent.type(current, 'old!');
    await userEvent.type(neo, 'new!');
    await userEvent.type(repeat, 'new!');

    const changeBtn = screen.getByRole('button', { name: /change password/i });
    await userEvent.click(changeBtn);

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

  it('upload image via FileUpload adds avatar to payload on Save', async () => {
    (global as any).URL = { ...(global as any).URL, createObjectURL: vi.fn(() => 'blob:fake-123') };

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeTruthy();

    const file = new File(['x'], 'avatar.png', { type: 'image/png' });
    await fireEvent.change(fileInput, { target: { files: [file] } });

    const saveBtn = screen.getByRole('button', { name: /save/i });
    await userEvent.click(saveBtn);

    await waitFor(() => {
      const payload = updateUser.mock.calls.at(-1)?.[0];
      expect(payload).toEqual(expect.objectContaining({ avatar: 'blob:fake-123' }));
      expect(notifyAdd).toHaveBeenCalledWith('userSettings.userUpdated', 'success');
    });
  });

  it('login: show change login card and update login', async () => {
    const tabs = screen.getAllByRole('tab');
    await userEvent.click(tabs[1]);

    const loginHeader = screen.getAllByText(
      (_, el) => el !== null && /^\s*login name \/ email\s*$/i.test(el.textContent ?? ''),
    )[0];
    expect(loginHeader).toBeTruthy();

    const loginSection = loginHeader.closest('.user__settings--security-section');
    expect(loginSection).toBeTruthy();

    await userEvent.click(within(loginSection as HTMLElement).getByText(/^change$/i));

    const newLoginInput = await screen.findByLabelText(/new login/i, { selector: 'input' });
    await userEvent.clear(newLoginInput);
    await userEvent.type(newLoginInput, 'new-login-id');

    const changeLoginBtn = screen.getByRole('button', { name: /change login/i });
    await userEvent.click(changeLoginBtn);

    await waitFor(() => {
      expect(updateUser).toHaveBeenCalledWith({ login: 'new-login-id' });
      expect(notifyAdd).toHaveBeenCalledWith('Login updated', 'success');
      expect(dialogClose).toHaveBeenCalledWith({ action: 'doLogout' });
    });
  });

  it('login: cancel change login hides the card', async () => {
    const tabs = screen.getAllByRole('tab');
    await userEvent.click(tabs[1]);

    const loginHeader = screen.getAllByText(
      (_, el) => el !== null && /^\s*login name \/ email\s*$/i.test(el.textContent ?? ''),
    )[0];
    const loginSection = loginHeader.closest('.user__settings--security-section') as HTMLElement;

    await userEvent.click(within(loginSection).getByText(/^change$/i));

    const cancelBtn = await screen.findByRole('button', { name: /cancel/i });
    await userEvent.click(cancelBtn);

    await waitFor(() => {
      expect(screen.getByText(/your login/i)).toBeInTheDocument();
    });

    expect(updateUser).not.toHaveBeenCalled();
  });

  it('password: Cancel closes the change-password card and clears error', async () => {
    const tabs = screen.getAllByRole('tab');
    await userEvent.click(tabs[1]);

    const pwdHeader = screen.getAllByText(
      (_, el) => el !== null && /^\s*password\s*$/i.test(el.textContent ?? ''),
    )[0];

    const sectionEl = pwdHeader.closest('.user__settings--security-section');
    expect(sectionEl).not.toBeNull();
    if (!(sectionEl instanceof HTMLElement)) {
      throw new Error('Expected HTMLElement');
    }

    await userEvent.click(within(sectionEl).getByText(/^change$/i));

    (changePassword as any).mockRejectedValueOnce(new Error('random-fail'));

    const current = screen.getByLabelText(/current password/i, { selector: 'input' });
    const neo = screen.getByLabelText(/new password/i, { selector: 'input' });
    const repeat = screen.getByLabelText(/repeat password/i, { selector: 'input' });

    await userEvent.type(current, 'old!');
    await userEvent.type(neo, 'a');
    await userEvent.type(repeat, 'b');

    const changeBtn = screen.getByRole('button', { name: /change password/i });
    await userEvent.click(changeBtn);
    expect(screen.getByText(/passwords do not match/i)).toBeVisible();

    const cancel = screen.getByRole('button', { name: /cancel/i });
    await userEvent.click(cancel);

    expect(screen.getByText(/your password/i)).toBeInTheDocument();
  });
});
