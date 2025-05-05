import type { AgencyInterface } from '@/legacy/interfaces/AgencyInterface';
import type { MutationTree } from 'vuex';
import type { AgenciesStateInterface } from '.';

const mutation: MutationTree<AgenciesStateInterface> = {
  SET_AGENCIES(state: AgenciesStateInterface, agencies: AgencyInterface[]) {
    state.agencies = agencies;
  },
};

export default mutation;
