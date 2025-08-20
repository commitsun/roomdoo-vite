import type { User } from '@/domain/entities/User';

export class CookieService {
  private static setCookie(name: string, value: string, days: number = 7): void {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  }

  private static getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }

  static setUserCookies(user: User): void {
    this.setCookie('id', user.id);
    this.setCookie('firstName', user.firstName);
    this.setCookie('defaultProperty', JSON.stringify(user.defaultProperty));
    this.setCookie('lastName', user.lastName);
    this.setCookie('lastName2', user.lastName2 || '');
    this.setCookie('email', user.email);
    this.setCookie('phone', user.phone || '');
    this.setCookie('avatar', user.avatar || '');
    this.setCookie('availabilityRuleFields', JSON.stringify(user.availabilityRuleFields || []));
  }

  static getUserCookies(): User | null {
    const id = this.getCookie('id');
    const email = this.getCookie('email');
    const firstName = this.getCookie('firstName');
    const defaultProperty = this.getCookie('defaultProperty');
    const lastName = this.getCookie('lastName');
    const lastName2 = this.getCookie('lastName2') || undefined;
    const phone = this.getCookie('phone') || undefined;
    const avatar = this.getCookie('avatar') || undefined;
    const availabilityRuleFields = JSON.parse(
      decodeURIComponent(this.getCookie('availabilityRuleFields') || '[]')
    );

    if (!id || !email || !firstName || !defaultProperty || !lastName) {
      return null;
    }

    return {
      id,
      email,
      firstName,
      defaultProperty: JSON.parse(defaultProperty),
      lastName,
      lastName2,
      phone,
      avatar,
      availabilityRuleFields,
    };
  }

  static clearUserCookies(): void {
    const cookies = [
      'id',
      'firstName',
      'defaultProperty',
      'lastName',
      'lastName2',
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
