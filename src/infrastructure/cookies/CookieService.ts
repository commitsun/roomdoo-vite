import type { User } from '@/domain/entities/User';

console.log(888);

export class CookieService {
  private static setCookie(name: string, value: string, days: number = 7): void {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  }

  private static getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const cookieValue = parts.pop()?.split(';').shift();
      return cookieValue !== undefined ? cookieValue : null;
    }
    return null;
  }

  static setUserCookies(user: User): void {
    this.setCookie('id', user.id.toString());
    this.setCookie('firstName', user.firstName);
    this.setCookie('defaultPmsProperty', JSON.stringify(user.defaultPmsProperty));
    this.setCookie('lastName', user.lastName);
    this.setCookie('lastName2', user.lastName2 ?? '');
    this.setCookie('lang', user.lang);
    this.setCookie('email', user.email);
    this.setCookie('phone', user.phone ?? '');
    this.setCookie('avatar', user.avatar ?? '');
    this.setCookie('availabilityRuleFields', JSON.stringify(user.availabilityRuleFields || []));
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
    const lang = this.readCookieField('lang', (value) => value ?? 'en');
    const lastName2 = this.readCookieField('lastName2', (value) => value);
    const phone = this.readCookieField('phone', (value) => (value !== null ? value : undefined));
    const avatar = this.readCookieField('avatar', (value) => (value !== null ? value : undefined));
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
      'availabilityRuleFields',
    ];

    cookies.forEach((cookie) => {
      document.cookie = `${cookie}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    });
  }
}
