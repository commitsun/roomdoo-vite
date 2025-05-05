import type { MutationTree } from 'vuex';
import type { NotificationsStateInterface } from '.';

const mutation: MutationTree<NotificationsStateInterface> = {
  SET_RESERVATIONS_TO_ASSIGN(state: NotificationsStateInterface, numReservationsToAssign: number) {
    state.numReservationsToAssign = numReservationsToAssign;
  },
};

export default mutation;
