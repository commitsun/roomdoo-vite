import type { UbicationInterface } from '@/interfaces/UbicationInterface';
import type { MutationTree } from 'vuex';
import type { UbicationStateInterface } from '.';

const mutation: MutationTree<UbicationStateInterface> = {
  SET_UBICATIONS(state: UbicationStateInterface, ubications: UbicationInterface[]) {
    state.ubications = ubications;
  },
};

export default mutation;
