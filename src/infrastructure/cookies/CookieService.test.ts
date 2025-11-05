import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { CookieService } from './CookieService';

import type { User } from '@/domain/entities/User';

const HTMLDocument: typeof Document = (globalThis as any).HTMLDocument ?? Document;

const originalCookieDesc =
  Object.getOwnPropertyDescriptor(Document.prototype, 'cookie') ??
  Object.getOwnPropertyDescriptor(HTMLDocument.prototype, 'cookie');

beforeEach(() => {
  if (originalCookieDesc) {
    Object.defineProperty(Document.prototype, 'cookie', originalCookieDesc);
    Object.defineProperty(HTMLDocument.prototype, 'cookie', originalCookieDesc);
  }
  vi.restoreAllMocks();
  CookieService.clearUserCookies();
  vi.useRealTimers();
});

afterEach(() => {
  if (originalCookieDesc) {
    Object.defineProperty(Document.prototype, 'cookie', originalCookieDesc);
    Object.defineProperty(HTMLDocument.prototype, 'cookie', originalCookieDesc);
  }
  vi.restoreAllMocks();
});

describe('CookieService', () => {
  it('setCookie writes with calculated expires and path=/', () => {
    const realSet = originalCookieDesc!.set!.bind(document);
    const setSpy = vi
      .spyOn(document as any, 'cookie', 'set')
      .mockImplementation((val: string) => realSet(val));

    vi.setSystemTime(new Date('2025-01-01T00:00:00Z'));
    (CookieService as any).setCookie('k', 'v', 10);

    expect(setSpy).toHaveBeenCalledTimes(1);
    const written = setSpy.mock.calls[0][0] as string;
    const expectedExpires = new Date(Date.UTC(2025, 0, 11, 0, 0, 0)).toUTCString();
    expect(written).toContain('k=v;');
    expect(written).toContain(`expires=${expectedExpires}`);
    expect(written).toContain('path=/');
    expect(document.cookie).toContain('k=v');
  });

  it('setUserCookies performs multiple sets and persists key values', () => {
    const realSet = originalCookieDesc!.set!.bind(document);
    const setSpy = vi
      .spyOn(document as any, 'cookie', 'set')
      .mockImplementation((val: string) => realSet(val));

    const user: User = {
      id: 42,
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      lastName2: 'Roe',
      lang: 'es_ES',
      phone: '+34 123',
      avatar: 'https://cdn/avatar.png',
      login: 'john.doe',
      defaultPmsProperty: { id: 1, name: 'Hotel One', image: '' },
      availabilityRuleFields: ['A', 'B'],
    };

    CookieService.setUserCookies(user);

    expect(setSpy).toHaveBeenCalled();
    expect(document.cookie).toContain('id=42');
    expect(document.cookie).toContain('firstName=John');
    expect(document.cookie).toContain('lastName=Doe');

    const parsed = CookieService.getUserCookies()!;
    expect(parsed.firstName).toBe('John');
    expect(parsed.lastName2).toBe('Roe');
  });

  it('getUserCookies reconstructs the complete user from valid cookies', () => {
    const user: User = {
      id: 5,
      email: 'u@ex.com',
      firstName: 'U',
      lastName: 'Ex',
      lastName2: 'Two',
      lang: 'gl_ES',
      phone: '555',
      avatar: '/img.png',
      login: 'u.ex',
      defaultPmsProperty: { id: 2, name: 'Prop', image: '' },
      availabilityRuleFields: ['AV'],
    };
    CookieService.setUserCookies(user);

    const parsed = CookieService.getUserCookies();
    expect(parsed).toEqual({
      id: 5,
      email: 'u@ex.com',
      firstName: 'U',
      lastName: 'Ex',
      lastName2: 'Two',
      lang: 'gl_ES',
      phone: '555',
      avatar: '/img.png',
      login: 'u.ex',
      defaultPmsProperty: { id: 2, name: 'Prop', image: '' },
      availabilityRuleFields: ['AV'],
    });
  });

  it('normalizes optional fields undefined to "" and availabilityRuleFields to []', () => {
    const user: User = {
      id: 7,
      email: 'a@b.com',
      firstName: 'A',
      lastName: 'B',
      lang: 'en_US',
      defaultPmsProperty: { id: 1, name: 'X', image: '' },
      login: '',
    };
    CookieService.setUserCookies(user);

    const parsed = CookieService.getUserCookies()!;
    expect(parsed.login).toBe('');
    expect(parsed.phone).toBe('');
    expect(parsed.avatar).toBe('');
    expect(parsed.lastName2).toBe('');
    expect(parsed.availabilityRuleFields).toEqual([]);
  });

  it('returns null if required fields are missing or id is not numeric', () => {
    document.cookie = `id=;path=/`;
    document.cookie = `email=z@x.com;path=/`;
    document.cookie = `firstName=Z;path=/`;
    document.cookie = `lastName=X;path=/`;
    document.cookie = `defaultPmsProperty=${JSON.stringify({ id: 1 })};path=/`;
    expect(CookieService.getUserCookies()).toBeNull();

    CookieService.clearUserCookies();

    document.cookie = `id=9;path=/`;
    document.cookie = `email=z@x.com;path=/`;
    document.cookie = `firstName=Z;path=/`;
    document.cookie = `lastName=X;path=/`;
    document.cookie = `defaultPmsProperty=null;path=/`;
    expect(CookieService.getUserCookies()).toBeNull();
  });

  it('default lang setting is "en" if the lang cookie is missing.', () => {
    document.cookie = `id=10;path=/`;
    document.cookie = `email=a@b.com;path=/`;
    document.cookie = `firstName=A;path=/`;
    document.cookie = `lastName=B;path=/`;
    document.cookie = `defaultPmsProperty=${JSON.stringify({ id: 1, name: 'X', image: '' })};path=/`;
    const u = CookieService.getUserCookies();
    expect(u).not.toBeNull();
    expect(u!.lang).toBe('en');
  });

  it('availabilityRuleFields with invalid JSON returns []', () => {
    document.cookie = `id=3;path=/`;
    document.cookie = `email=a@b.com;path=/`;
    document.cookie = `firstName=A;path=/`;
    document.cookie = `lastName=B;path=/`;
    document.cookie = `defaultPmsProperty=${JSON.stringify({ id: 1, name: 'X', image: '' })};path=/`;
    document.cookie = `availabilityRuleFields=NOT_JSON;path=/`;
    const u = CookieService.getUserCookies();
    expect(u).not.toBeNull();
    expect(u!.availabilityRuleFields).toEqual([]);
  });

  it('availabilityRuleFields missing returns []', () => {
    document.cookie = `id=3;path=/`;
    document.cookie = `email=a@b.com;path=/`;
    document.cookie = `firstName=A;path=/`;
    document.cookie = `lastName=B;path=/`;
    document.cookie = `defaultPmsProperty=${JSON.stringify({ id: 1, name: 'X', image: '' })};path=/`;
    const u = CookieService.getUserCookies();
    expect(u).not.toBeNull();
    expect(u!.availabilityRuleFields).toEqual([]);
  });

  it('lastName2 missing => undefined; phone/avatar missing => undefined; login missing => ""', () => {
    document.cookie = `id=11;path=/`;
    document.cookie = `email=a@b.com;path=/`;
    document.cookie = `firstName=A;path=/`;
    document.cookie = `lastName=B;path=/`;
    document.cookie = `defaultPmsProperty=${JSON.stringify({ id: 1, name: 'X', image: '' })};path=/`;
    const u = CookieService.getUserCookies()!;
    expect(u.lastName2).toBeUndefined();
    expect(u.phone).toBeUndefined();
    expect(u.avatar).toBeUndefined();
    expect(u.login).toBe('');
  });

  it('getCookie returns null when it does not exist', () => {
    expect((CookieService as any).getCookie('nope')).toBeNull();
  });

  it('getCookie gets the correct value among multiple written cookies', () => {
    document.cookie = `a=1;path=/`;
    document.cookie = `b=2;path=/`;
    document.cookie = `firstName=John;path=/`;
    document.cookie = `c=3;path=/`;
    expect((CookieService as any).getCookie('firstName')).toBe('John');
  });

  it('clearUserCookies expires all and getUserCookies returns null', () => {
    const user: User = {
      id: 1,
      email: 'e@e.com',
      firstName: 'E',
      lastName: 'F',
      lang: 'es_ES',
      login: 'ef',
      defaultPmsProperty: { id: 1, name: 'P', image: '' },
    };
    CookieService.setUserCookies(user);
    expect(CookieService.getUserCookies()).not.toBeNull();
    CookieService.clearUserCookies();
    expect(CookieService.getUserCookies()).toBeNull();
  });

  it('getCookie returns "" when the cookie exists but is empty', () => {
    document.cookie = `emptyKey=;path=/`;
    const v = (CookieService as any).getCookie('emptyKey');
    expect(v).toBe('');
  });

  it('setUserCookies writes "" for missing optionals and availabilityRuleFields as []', () => {
    const originalDesc =
      Object.getOwnPropertyDescriptor(Document.prototype, 'cookie') ??
      Object.getOwnPropertyDescriptor(HTMLDocument.prototype, 'cookie');
    const realSet = originalDesc!.set!.bind(document);

    const setSpy = vi
      .spyOn(document as any, 'cookie', 'set')
      .mockImplementation((val: string) => realSet(val));

    const user: User = {
      id: 99,
      email: 'n@x.com',
      firstName: 'N',
      lastName: 'X',
      login: 'n.x',
      lang: 'es_ES',
      defaultPmsProperty: { id: 1, name: 'Prop', image: '' },
    };

    CookieService.setUserCookies(user);

    const writes = setSpy.mock.calls.map((c) => String(c[0]));
    expect(writes.some((s) => s.startsWith('lastName2='))).toBe(true);
    expect(writes.some((s) => s.startsWith('phone='))).toBe(true);
    expect(writes.some((s) => s.startsWith('avatar='))).toBe(true);
    expect(writes.some((s) => s.startsWith('login='))).toBe(true);

    const arfWrite = writes.find((s) => s.startsWith('availabilityRuleFields='));
    expect(arfWrite).toBeTruthy();
    expect(arfWrite!).toContain('availabilityRuleFields=[]');

    expect(document.cookie).toContain('id=99');
  });

  it('getCookie returns null if cookieValue is undefined even if there is a match (false branch of ternary)', () => {
    const realSplit = String.prototype.split;

    const name = 'weird';
    const splitSpy = vi.spyOn(String.prototype, 'split').mockImplementation(function (
      this: string,
      sep: any,
    ): string[] {
      if (sep === `; ${name}=`) {
        return ['prefix', 'tail'];
      }
      if (sep === ';') {
        return [];
      }
      return realSplit.call(this, sep as any);
    });

    document.cookie = `a=1; ${name}=whatever; b=2;path=/`;

    const res = (CookieService as any).getCookie(name);
    expect(res).toBeNull();
    splitSpy.mockRestore();
  });
  it('defaultPmsProperty malformed triggers catch and makes getUserCookies return null', () => {
    document.cookie = `id=77;path=/`;
    document.cookie = `email=bad@ex.com;path=/`;
    document.cookie = `firstName=Bad;path=/`;
    document.cookie = `lastName=Json;path=/`;
    document.cookie = `defaultPmsProperty=}{;path=/`;

    const u = CookieService.getUserCookies();
    expect(u).toBeNull();
  });
});
