import type { TransactionMethodInterface } from 'src/interfaces/TransactionMethodInterface';
import type { MutationTree } from 'vuex';
import type { AccountJournalsStateInterface } from '.';

const mutation: MutationTree<AccountJournalsStateInterface> = {
  SET_ACCOUNT_JOURNALS(
    state: AccountJournalsStateInterface,
    payload: TransactionMethodInterface[],
  ) {
    state.accountJournals = payload;
  },
};

export default mutation;
