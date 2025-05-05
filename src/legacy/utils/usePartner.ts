import { useStore } from '@/legacy/store';
import { type PayloadPartnerRequestInterface } from '@/legacy/interfaces/PayloadPartnerRequestInterface';
import utils from './utils';
import { dialogService } from '@/legacy/services/DialogService';

export function usePartner() {
  const store = useStore();

  const fetchPartners = utils.debounce(async (payload: PayloadPartnerRequestInterface) => {
    void store.dispatch('layout/showSpinner', true);
    try {
      if (payload.isRemovedPartnersBeforeSearch) {
        await store.dispatch('partners/removePartners');
      }
      await store.dispatch('partners/fetchPartners', payload);
    } catch {
      dialogService.open({
        header: 'Error',
        content: 'Algo ha ido mal',
        btnAccept: 'Ok',
      });
    } finally {
      void store.dispatch('layout/showSpinner', false);
    }
  }, 300);

  return {
    fetchPartners,
  };
}
