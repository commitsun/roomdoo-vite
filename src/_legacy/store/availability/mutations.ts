import type { AvailabilityInterface } from '@/_legacy/interfaces/AvailabilityInterface';
import type { MutationTree } from 'vuex';
import type { AvailabilityStateInterface } from '.';

const mutation: MutationTree<AvailabilityStateInterface> = {
  SET_AVAILABILITY(state: AvailabilityStateInterface, availability: AvailabilityInterface[]) {
    availability.forEach((av) => {
      av.date = new Date(av.date);
    });
    state.availability = availability;
  },
};

export default mutation;
