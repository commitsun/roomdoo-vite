import { useStore } from '@/store';
import { type PayloadInvoiceRequestInterface } from '@/interfaces/PayloadInvoiceRequestInterface';
import utils from '@/utils/utils';
import { dialogService } from '@/services/DialogService';

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
