import { useStore } from '@/legacy/store';
import { type PayloadInvoiceRequestInterface } from '@/legacy/interfaces/PayloadInvoiceRequestInterface';
import utils from '@/legacy/utils/utils';
import { dialogService } from '@/legacy/services/DialogService';

export function useInvoices() {
  const store = useStore();

  const fetchInvoices = utils.debounce(async (payload: PayloadInvoiceRequestInterface) => {
    void store.dispatch('layout/showSpinner', true);
    try {
      await store.dispatch('invoices/fetchInvoices', payload);
    } catch (error) {
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
    fetchInvoices,
  };
}
