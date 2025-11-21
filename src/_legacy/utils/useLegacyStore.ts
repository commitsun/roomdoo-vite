import { useStore } from '@/_legacy/store';

export function useLegacyStore() {
  const store = useStore();

  const doVuexLogin = async (email: string, password: string) => {
    await store.dispatch('user/login', { email, password });
  };

  const removeVuexAndOldCookiesUser = () => {
    store.dispatch('user/reset');
  };

  const fetchAndSetVuexPartnerAndActiveProperty = async (
    partnerId: number,
    pmsPropertyId: number
  ) => {
    await store.dispatch('properties/fetchProperties');
    await store.dispatch('properties/setActiveProperty', pmsPropertyId);
    await store.dispatch('partners/fetchCurrentPartner', partnerId);
  };

  const removeVuexPartner = async (pmsPropertyId: number) => {
    await store.dispatch('properties/fetchProperties');
    await store.dispatch('properties/setActiveProperty', pmsPropertyId);
    await store.dispatch('partners/removePartner');
  };

  const setCurrentPmsPropertyId = async (pmsPropertyId: number) => {
    await store.dispatch('properties/setActiveProperty', pmsPropertyId);
  };

  return {
    doVuexLogin,
    removeVuexAndOldCookiesUser,
    fetchAndSetVuexPartnerAndActiveProperty,
    removeVuexPartner,
    setCurrentPmsPropertyId
  };
}
