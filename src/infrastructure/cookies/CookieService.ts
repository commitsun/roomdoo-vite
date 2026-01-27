import type { User } from '@/domain/entities/User';

type CookieOptions = {
  days?: number;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'Lax' | 'Strict' | 'None';
};

const DEFAULT_OPTIONS: Required<Pick<CookieOptions, 'days' | 'path' | 'sameSite'>> = {
  days: 7,
  path: '/',
  sameSite: 'Lax',
};

export class CookieService {
  private static buildCookieString(name: string, value: string, options: CookieOptions): string {
    const merged = { ...DEFAULT_OPTIONS, ...options };
    const expires = new Date(Date.now() + merged.days * 24 * 60 * 60 * 1000).toUTCString();

    const encodedName = encodeURIComponent(name);
    const encodedValue = encodeURIComponent(value);

    let cookie = `${encodedName}=${encodedValue}; Path=${merged.path}; Expires=${expires}; SameSite=${merged.sameSite}`;

    if (typeof merged.domain === 'string' && merged.domain.length > 0) {
      cookie += `; Domain=${merged.domain}`;
    }

    const shouldBeSecure =
      merged.secure ?? (merged.sameSite === 'None' ? true : window.location.protocol === 'https:');

    if (shouldBeSecure) {
      cookie += '; Secure';
    }

    return cookie;
  }

  private static setCookie(
    name: string,
    value: string,
    optionsOrDays: CookieOptions | number = {},
  ): void {
    const options: CookieOptions =
      typeof optionsOrDays === 'number' ? { days: optionsOrDays } : optionsOrDays;

    document.cookie = this.buildCookieString(name, value, options);
  }

  private static getCookie(name: string): string | null {
    const target = `${encodeURIComponent(name)}=`;
    const parts = document.cookie ? document.cookie.split(/;\s*/) : [];

    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.startsWith(target)) {
        return decodeURIComponent(trimmed.slice(target.length));
      }
    }
    return null;
  }

  private static deleteCookie(
    name: string,
    options: Pick<CookieOptions, 'path' | 'domain'> = {},
  ): void {
    const encodedName = encodeURIComponent(name);
    const path = options.path ?? DEFAULT_OPTIONS.path;

    let cookie = `${encodedName}=; Path=${path}; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0`;

    if (typeof options.domain === 'string' && options.domain.length > 0) {
      cookie += `; Domain=${options.domain}`;
    }

    document.cookie = cookie;
  }

  private static readonly COOKIE_PATH = '/';

  static setUserCookies(user: User): void {
    const opt: CookieOptions = { path: this.COOKIE_PATH };

    this.setCookie('id', user.id.toString(), opt);
    this.setCookie('firstName', user.firstName, opt);
    this.setCookie('defaultPmsProperty', JSON.stringify(user.defaultPmsProperty), opt);
    this.setCookie('lastName', user.lastName, opt);
    this.setCookie('lastName2', user.lastName2 ?? '', opt);
    this.setCookie('lang', user.lang, opt);
    this.setCookie('email', user.email, opt);
    this.setCookie('phone', user.phone ?? '', opt);
    this.setCookie('avatar', user.avatar ?? '', opt);
    this.setCookie('login', user.login, opt);
    this.setCookie(
      'availabilityRuleFields',
      JSON.stringify(user.availabilityRuleFields || []),
      opt,
    );
  }

  private static readCookieField<T>(name: string, parser: (value: string | null) => T): T {
    return parser(this.getCookie(name));
  }

  static getUserCookies(): User | null {
    const id = this.readCookieField('id', (value) => parseInt(value ?? '', 10));
    const email = this.readCookieField('email', (value) => value);
    const firstName = this.readCookieField('firstName', (value) => value);
    const defaultPmsProperty = this.readCookieField('defaultPmsProperty', (value) => {
      try {
        return JSON.parse(value ?? 'null');
      } catch {
        return null;
      }
    });
    const lastName = this.readCookieField('lastName', (value) => value);
    const lang = this.readCookieField('lang', (value) => value ?? 'en-US');
    const lastName2 = this.readCookieField('lastName2', (value) => value);
    const phone = this.readCookieField('phone', (value) => (value !== null ? value : undefined));
    const avatar = this.readCookieField('avatar', (value) => (value !== null ? value : undefined));
    const login = this.readCookieField('login', (value) => (value !== null ? value : undefined));
    const availabilityRuleFields = this.readCookieField('availabilityRuleFields', (value) => {
      try {
        return value !== null ? JSON.parse(value) : [];
      } catch {
        return [];
      }
    });

    const isValidUser =
      id !== null &&
      !isNaN(id) &&
      email !== null &&
      firstName !== null &&
      defaultPmsProperty !== null &&
      lastName !== null;

    if (!isValidUser) {
      return null;
    }

    return {
      id,
      email,
      firstName,
      defaultPmsProperty,
      lastName,
      lang,
      lastName2: lastName2 ?? undefined,
      phone,
      avatar,
      login: login ?? '',
      availabilityRuleFields,
    };
  }

  static clearUserCookies(): void {
    const cookies = [
      'id',
      'firstName',
      'defaultPmsProperty',
      'lastName',
      'lastName2',
      'lang',
      'email',
      'phone',
      'avatar',
      'login',
      'availabilityRuleFields',
    ];

    cookies.forEach((cookie) => {
      this.deleteCookie(cookie, { path: this.COOKIE_PATH });
    });
  }
}
