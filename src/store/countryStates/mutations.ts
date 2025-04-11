import type { CountryStatesInterface } from '@/interfaces/CountryStatesInterface';

import type { MutationTree } from 'vuex';
import type { CountryStatesStateInterface } from '.';

const mutation: MutationTree<CountryStatesStateInterface> = {
  SET_COUNTRY_STATES(state: CountryStatesStateInterface, countryStates: CountryStatesInterface[]) {
    state.countryStates = countryStates;
  },

  REMOVE_COUNTRY_STATES(state: CountryStatesStateInterface) {
    state.countryStates = [];
  },
};

export default mutation;
