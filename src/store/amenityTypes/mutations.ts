import type { AmenityTypeInterface } from '@/interfaces/AmenityTypeInterface';
import type { MutationTree } from 'vuex';
import type { AmenityTypesStateInterface } from '.';

const mutation: MutationTree<AmenityTypesStateInterface> = {
  SET_AMENITY_TYPES(state: AmenityTypesStateInterface, amenityTypes: AmenityTypeInterface[]) {
    state.amenityTypes = amenityTypes;
  },
};

export default mutation;
