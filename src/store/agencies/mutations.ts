import type { AgencyInterface } from '@/interfaces/AgencyInterface';
import type { MutationTree } from 'vuex';
import type { AgenciesStateInterface } from '.';

const mutation: MutationTree<AgenciesStateInterface> = {
  SET_AGENCIES(state: AgenciesStateInterface, agencies: AgencyInterface[]) {
    state.agencies = agencies;
  },
};

export default mutation;
