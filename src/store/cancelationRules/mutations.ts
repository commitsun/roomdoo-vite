import type { CancelationRuleInterface } from '@/interfaces/CancelationRuleInterface';
import type { MutationTree } from 'vuex';
import type { CancelationRulesStateInterface } from '.';

const mutation: MutationTree<CancelationRulesStateInterface> = {
  SET_CANCELATION_RULES(
    state: CancelationRulesStateInterface,
    cancelationRules: CancelationRuleInterface[]
  ) {
    state.cancelationRules = cancelationRules;
  },
};

export default mutation;
