
export type CookieOptions = {
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

const buildCookieString = (name: string, value: string, options: CookieOptions): string => {
  const merged = { ...DEFAULT_OPTIONS, ...options };
  const expires = new Date(Date.now() + merged.days * 24 * 60 * 60 * 1000).toUTCString();

  const encodedName = encodeURIComponent(name);
  const encodedValue = encodeURIComponent(value);

  let cookie = `${encodedName}=${encodedValue}; Path=${merged.path}; Expires=${expires}; SameSite=${merged.sameSite}`;

  if (merged.domain) cookie += `; Domain=${merged.domain}`;

  const shouldBeSecure =
    merged.secure ??
    (merged.sameSite === 'None' ? true : window.location.protocol === 'https:');

  if (shouldBeSecure) cookie += '; Secure';

  return cookie;
};

const setCookie = (name: string, value: string, options: CookieOptions = {}): void => {
  document.cookie = buildCookieString(name, value, options);
};

const getCookie = (name: string): string | null => {
  const target = `${encodeURIComponent(name)}=`;
  const parts = document.cookie ? document.cookie.split('; ') : [];

  for (const part of parts) {
    if (part.startsWith(target)) {
      return decodeURIComponent(part.slice(target.length));
    }
  }
  return null;
};

const getAllCookies = (): Record<string, string> => {
  const parts = document.cookie ? document.cookie.split('; ') : [];
  const result: Record<string, string> = {};

  for (const part of parts) {
    const eqIndex = part.indexOf('=');
    if (eqIndex === -1) continue;

    const key = decodeURIComponent(part.slice(0, eqIndex));
    const value = decodeURIComponent(part.slice(eqIndex + 1));
    result[key] = value;
  }

  return result;
};

const deleteCookie = (name: string, options: Pick<CookieOptions, 'path' | 'domain'> = {}): void => {
  const encodedName = encodeURIComponent(name);
  const path = options.path ?? DEFAULT_OPTIONS.path;

  let cookie = `${encodedName}=; Path=${path}; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=${DEFAULT_OPTIONS.sameSite}`;

  if (options.domain) cookie += `; Domain=${options.domain}`;

  if (window.location.protocol === 'https:') cookie += '; Secure';

  document.cookie = cookie;
};

export { setCookie, getCookie, getAllCookies, deleteCookie };
