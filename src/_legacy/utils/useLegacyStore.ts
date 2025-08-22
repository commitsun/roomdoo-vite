import { useStore } from '@/_legacy/store';

export function useLegacyStore() {
  const store = useStore();

  const doVuexLogin = async (email: string, password: string) => {
    await store.dispatch('user/login', { email, password });
  };

  const removeVuexAndOldCookiesUser = () => {
    store.dispatch('user/reset');
  };

  return {
    doVuexLogin,
    removeVuexAndOldCookiesUser,
  };
}
