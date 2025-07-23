import type { PmsProperty } from '@/domain/entities/PmsProperty';
import type { User } from '@/domain/entities/User';

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
    defaultProperty: PmsProperty;
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

  static getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }

  static getAllCookies(): Record<string, string> {
    const cookies: Record<string, string> = {};
    document.cookie.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[name] = value;
      }
    });
    return cookies;
  }

  static recoverUserFromCookies(): User | null {
    const defaultProperty = this.getCookie('defaultProperty');
    const id = this.getCookie('id');
    const firstName = this.getCookie('firstName');
    const lastName = this.getCookie('lastName');
    const lastName2 = this.getCookie('lastName2');
    const email = this.getCookie('email');
    const phone = this.getCookie('phone');
    const avatar = this.getCookie('avatar');
    const availabilityRuleFields = this.getCookie('availabilityRuleFields');

    // Verificar que tenemos los datos mínimos necesarios
    if (!id || !email || !firstName) {
      return null;
    }

    return {
      id: id,
      email: email,
      firstName: firstName,
      lastName: lastName || '',
      lastName2: lastName2 || '',
      defaultProperty: defaultProperty ? JSON.parse(defaultProperty) : { id: '' },
      phone: phone || '',
      avatar: avatar || '',
      availabilityRuleFields: availabilityRuleFields ? JSON.parse(availabilityRuleFields) : [],
    };
  }

}
