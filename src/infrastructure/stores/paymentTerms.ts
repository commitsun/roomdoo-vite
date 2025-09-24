import { defineStore } from 'pinia';
import { readonly, ref, type Ref } from 'vue';

import { PaymentTermService } from '@/application/paymentTerm/PaymentTermService';
import { PaymentTermRepositoryImpl } from '@/infrastructure/repositories/PaymentTermRepositoryImpl';
import type { PaymentTerm } from '@/domain/entities/PaymentTerm';

const paymentTermsRepository = new PaymentTermRepositoryImpl();

export const usePaymentTermsStore = defineStore('paymentTerms', () => {
  const paymentTermsService = new PaymentTermService(paymentTermsRepository);
  const paymentTerms: Ref<PaymentTerm[]> = ref([]);
  const fetchPaymentTerms = async () => {
    paymentTerms.value = await paymentTermsService.fetchPaymentTerms();
  };
  return {
    paymentTerms: readonly(paymentTerms),
    fetchPaymentTerms,
  };
});
