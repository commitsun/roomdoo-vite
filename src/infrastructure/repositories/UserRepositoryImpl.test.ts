import { describe, it, expect, vi, beforeEach } from 'vitest';

import { UsersRepositoryImpl } from './UserRepositoryImpl';

// Mock axios api instance
vi.mock('@/infrastructure/http/axios', () => {
  return {
    api: {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
    },
  };
});

const updatePrimevueLocaleSpy = vi.fn();
vi.mock('@/infrastructure/plugins/primevue', () => {
  return {
    updatePrimevueLocale: (lang: string) => updatePrimevueLocaleSpy(lang),
  };
});

const clearCookiesSpy = vi.fn();
vi.mock('../cookies/CookieService', () => {
  return {
    CookieService: {
      clearUserCookies: () => clearCookiesSpy(),
    },
  };
});

import { api } from '@/infrastructure/http/axios';

declare const global: any;
describe('UsersRepositoryImpl', () => {
  let repo: UsersRepositoryImpl;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new UsersRepositoryImpl();
    (api.put as any) = vi.fn().mockResolvedValue({});
    global.fetch = vi.fn();
  });

  //login
  describe('login', () => {
    it('sends correct payload in login', async () => {
      (api.post as any).mockResolvedValue({});

      await repo.login('someone@mail.com', 'secret');
      expect(api.post).toHaveBeenCalledWith('/login', {
        username: 'someone@mail.com',
        password: 'secret',
      });
    });
    it('propagates axios errors in login', async () => {
      const err = new Error('axios fail');
      (api.post as any).mockRejectedValue(err);

      await expect(repo.login('admin', '123')).rejects.toThrow(err);
    });
  });

  //fetchUser
  describe('fetchUser', () => {
    it('returns user with correct field names', async () => {
      (api.get as any).mockResolvedValue({
        data: {
          id: 7,
          firstname: 'Ada',
          lastname: 'Lovelace',
          lastname2: 'Byron',
          image: 'https://cdn/avatar.png',
          lang: 'es_ES',
          email: 'ada@example.com',
        },
      });

      const user = await repo.fetchUser();

      expect(api.get).toHaveBeenCalledWith('/user');
      expect(user.firstName).toBe('Ada');
      expect(user.lastName).toBe('Lovelace');
      expect(user.lastName2).toBe('Byron');
      expect(user.lang).toBe('es-ES');
      expect(user.avatar).toBe('https://cdn/avatar.png');
    });
    it('propagates axios errors in fetchUser', async () => {
      const err = new Error('axios fail');
      (api.get as any).mockRejectedValue(err);

      await expect(repo.fetchUser()).rejects.toThrow(err);
    });
  });

  //fetchAvailabilityRuleFields
  describe('fetchAvailabilityRuleFields', () => {
    it('returns array of field names', async () => {
      (api.get as any).mockResolvedValue({
        data: [{ name: 'min_stay' }, { name: 'quota' }],
      });

      const fields = await repo.fetchAvailabilityRuleFields();

      expect(api.get).toHaveBeenCalledWith('/user/availability-rule-fields');
      expect(fields).toEqual(['min_stay', 'quota']);
    });
    it('propagates axios errors in fetchAvailabilityRuleFields', async () => {
      const err = new Error('axios fail');
      (api.get as any).mockRejectedValue(err);

      await expect(repo.fetchAvailabilityRuleFields()).rejects.toThrow(err);
    });
  });

  //requestChangePassword
  describe('requestChangePassword', () => {
    it('sends correct payload in requestChangePassword', async () => {
      (api.post as any).mockResolvedValue({});

      await repo.requestChangePassword('reset@demo.com');
      expect(api.post).toHaveBeenCalledWith('/send-mail-reset-password', {
        email: 'reset@demo.com',
      });
    });

    it('propagates axios errors in requestChangePassword', async () => {
      const err = new Error('axios fail');
      (api.post as any).mockRejectedValue(err);

      await expect(repo.requestChangePassword('example@mail.com')).rejects.toThrow(err);
    });
  });
  //changePassword
  describe('changePassword', () => {
    it('sends correct payload in changePassword', async () => {
      (api.patch as any).mockResolvedValue({});

      await repo.changePassword('old', 'new');
      expect(api.patch).toHaveBeenCalledWith('/user/change-password', {
        oldPassword: 'old',
        newPassword: 'new',
      });
    });
    it('propagates axios errors in changePassword', async () => {
      const err = new Error('axios fail');
      (api.patch as any).mockRejectedValue(err);

      await expect(repo.changePassword('oldPassword', 'newPassword')).rejects.toThrow(err);
    });
  });

  //resetPassword
  describe('resetPassword', () => {
    it('sends correct payload in resetPassword', async () => {
      (api.patch as any).mockResolvedValue({});

      await repo.resetPassword('N3wPass!', 'jwt-token');
      expect(api.patch).toHaveBeenCalledWith('/reset-password', {
        newPassword: 'N3wPass!',
        resetToken: 'jwt-token',
      });
    });
    it('propagates axios errors in resetPassword', async () => {
      const err = new Error('axios fail');
      (api.patch as any).mockRejectedValue(err);

      await expect(repo.resetPassword('newPassword', 'token')).rejects.toThrow(err);
    });
  });

  //refreshToken
  describe('refreshToken', () => {
    it('sends correct payload in refreshToken', async () => {
      (api.post as any).mockResolvedValue({});

      await repo.refreshToken();
      expect(api.post).toHaveBeenCalledWith('/refresh-token');
    });
    it('propagates axios errors in refreshToken', async () => {
      const err = new Error('axios fail');
      (api.post as any).mockRejectedValue(err);

      await expect(repo.refreshToken()).rejects.toThrow(err);
    });
  });

  //updateUser
  describe('updateUser', () => {
    it('sends correct payload in updateUser', async () => {
      (api.patch as any).mockResolvedValue({});

      await repo.updateUser({
        firstName: 'John',
        lastName: 'Doe',
        lastName2: 'Roe',
        phone: '123-456',
        email: 'john@example.com',
        lang: 'en-US',
        login: 'johnny',
      });

      expect(api.patch).toHaveBeenCalledWith('/user', {
        firstname: 'John',
        lastname: 'Doe',
        lastname2: 'Roe',
        phone: '123-456',
        email: 'john@example.com',
        lang: 'en_US',
        login: 'johnny',
      });
    });

    it('uploads avatar with proper headers and file extension inferred from blob.type, then patches user', async () => {
      const fakeBlob = new Blob(['xxx'], { type: 'image/jpeg' });
      (global.fetch as any).mockResolvedValue({ blob: vi.fn().mockResolvedValue(fakeBlob) });

      await repo.updateUser({ avatar: 'https://cdn/img.jpg', firstName: 'Jane' });

      expect(api.put).toHaveBeenCalledTimes(1);
      expect(api.put).toHaveBeenCalledWith('/user/image', expect.any(FormData), {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      expect(api.patch).toHaveBeenCalledWith('/user', { firstname: 'Jane' });
    });

    it('falls back to png when blob.type is missing', async () => {
      const fakeBlob = new Blob(['xxx']); // sin type
      (global.fetch as any).mockResolvedValue({ blob: vi.fn().mockResolvedValue(fakeBlob) });

      await repo.updateUser({ avatar: '/img' });

      const appendSpy = vi.spyOn(FormData.prototype, 'append');
      await repo.updateUser({ avatar: '/img2' });
      const fileArg = appendSpy.mock.calls.at(-1)?.[1] as File;
      expect(fileArg.name).toBe('avatar.png');
      expect(fileArg.type).toBe('image/png');
    });

    it('updates i18n locale on user update', async () => {
      (api.patch as any).mockResolvedValue({});
      const { i18n } = await import('@/infrastructure/plugins/i18n');

      await repo.updateUser({ lang: 'es-ES' });

      expect(api.patch).toHaveBeenCalledWith('/user', { lang: 'es_ES' });

      expect(i18n.global.locale.value).toBe('es-ES');
      expect(updatePrimevueLocaleSpy).toHaveBeenCalledWith('es');
    });
    it('propagates axios errors in updateUser', async () => {
      const err = new Error('axios fail');
      (api.patch as any).mockRejectedValue(err);

      await expect(repo.updateUser({ firstName: 'NewName' })).rejects.toThrow(err);
    });
  });
  describe('logout', () => {
    it('logout llama a CookieService.clearUserCookies', () => {
      repo.logout();
      expect(clearCookiesSpy).toHaveBeenCalledTimes(1);
    });
  });
});
