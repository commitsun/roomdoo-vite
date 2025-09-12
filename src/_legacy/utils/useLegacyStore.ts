import { useStore } from '@/_legacy/store';

export function useLegacyStore() {
  const store = useStore();

  const doVuexLogin = async (email: string, password: string) => {
    await store.dispatch('user/login', { email, password });
  };

  const removeVuexAndOldCookiesUser = () => {
    store.dispatch('user/reset');
  };

  const fetchAndSetVuexPartnerAndACtiveProperty = async (partnerId: number, propertyId: number) => {
    await store.dispatch('properties/fetchProperties');
    await store.dispatch('properties/setActiveProperty', propertyId);
    await store.dispatch('partners/fetchCurrentPartner', partnerId);
  };

  return {
    doVuexLogin,
    removeVuexAndOldCookiesUser,
    fetchAndSetVuexPartnerAndACtiveProperty,
  };
}
