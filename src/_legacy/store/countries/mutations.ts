import type { CountryInterface } from '@/_legacy/interfaces/CountryInterface';

import type { MutationTree } from 'vuex';
import type { CountryStateInterface } from '.';

const mutation: MutationTree<CountryStateInterface> = {
  SET_COUNTRIES(state: CountryStateInterface, countries: CountryInterface[]) {
    state.countries = countries;
  },
};

export default mutation;
