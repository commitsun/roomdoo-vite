import type { PaymentTermInterface } from '@/interfaces/PaymentTermInterface';
import type { MutationTree } from 'vuex';
import type { PaymentTermStateInterface } from '.';

const mutation: MutationTree<PaymentTermStateInterface> = {
  SET_TRANSACTION_TERMS(state: PaymentTermStateInterface, paymentTerms: PaymentTermInterface[]) {
    state.paymentTerms = paymentTerms;
  },
};

export default mutation;
