const setCookie = (name: string, value: string, days = 7) => {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; expires=${expires}`;
};

const getCookie = (name: string): string | null => {
  const cookies = document.cookie.split('; ').reduce(
    (acc, current) => {
      const [key, value] = current.split('=');
      acc[key] = decodeURIComponent(value);
      return acc;
    },
    {} as Record<string, string>,
  );
  return cookies[name] || null;
};

const getAllCookies = (): Record<string, string> => {
  return document.cookie.split('; ').reduce(
    (cookies, current) => {
      const [key, value] = current.split('=');
      if (key) {
        cookies[key] = decodeURIComponent(value || '');
      }
      return cookies;
    },
    {} as Record<string, string>,
  );
};

const deleteCookie = (name: string) => {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
};
export { setCookie, getCookie, getAllCookies, deleteCookie };
