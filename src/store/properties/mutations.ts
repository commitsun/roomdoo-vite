import type { PropertyInterface } from '@/interfaces/PropertyInterface';

import type { MutationTree } from 'vuex';
import type { PropertyStateInterface } from '.';

const mutation: MutationTree<PropertyStateInterface> = {
  SET_PROPERTIES(state: PropertyStateInterface, payload: PropertyInterface[]) {
    state.properties = payload;
  },
  SET_ACTIVE_PROPERTY(state: PropertyStateInterface, payload: PropertyInterface) {
    state.activeProperty = payload;
  },
  CLEAR_ACTIVE_PROPERTY(state: PropertyStateInterface) {
    state.activeProperty = null;
  },
};

export default mutation;
