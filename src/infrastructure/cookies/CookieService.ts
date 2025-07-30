import type { PmsProperty } from '@/domain/entities/PmsProperty';

export class CookieService {
  private static setCookie(name: string, value: string, days: number = 7): void {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  }


  static setUserCookies(user: {
    id: string;
    email: string;
    firstName: string;
    defaultProperty:  PmsProperty;
    lastName: string;
    lastName2?: string;
    phone?: string;
    avatar?: string;
    availabilityRuleFields?: string[];
  }): void {
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

  static clearUserCookies(): void {
    const cookies = [
      'id', 'firstName', 'defaultProperty', 'lastName', 'lastName2', 'email', 'phone', 'avatar', 'availabilityRuleFields',
    ];

    cookies.forEach(cookie => {
      document.cookie = `${cookie}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    });
  }

}
