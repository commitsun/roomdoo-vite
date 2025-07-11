import type { AmenityInterface } from '@/_legacy/interfaces/AmenityInterface';
import type { MutationTree } from 'vuex';
import type { AmenitiesStateInterface } from '.';

const mutation: MutationTree<AmenitiesStateInterface> = {
  SET_AMENITIES(state: AmenitiesStateInterface, amenitites: AmenityInterface[]) {
    state.amenities = amenitites;
  },
};

export default mutation;
