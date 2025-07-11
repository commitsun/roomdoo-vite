import type { ReservationInterface } from '@/_legacy/interfaces/ReservationInterface';
import type { ReservationWizardStateInterface } from '@/_legacy/interfaces/ReservationWizardStateInterface';

import type { MutationTree } from 'vuex';
import type { ReservationStateInterface } from '.';

const mutation: MutationTree<ReservationStateInterface> = {
  SET_RESERVATIONS(state: ReservationStateInterface, reservations: ReservationInterface[]) {
    reservations.forEach((el) => {
      el.checkin = new Date(el.checkin);
      el.checkout = new Date(el.checkout);
    });
    state.reservations = reservations;
  },
  SET_CURRENT_RESERVATION(state: ReservationStateInterface, reservation: ReservationInterface) {
    if (reservation) {
      reservation.checkin = new Date(reservation.checkin);
      reservation.checkout = new Date(reservation.checkout);
    }
    state.currentReservation = reservation;
  },
  SET_CURRENT_RESERVATIONS(state: ReservationStateInterface, reservations: ReservationInterface[]) {
    if (reservations && reservations.length > 0) {
      reservations.forEach((res) => {
        res.checkin = new Date(res.checkin);
        res.checkout = new Date(res.checkout);
      });
    }
    state.reservations = reservations;
  },
  SET_PARTNER_RESERVATIONS_AS_HOST(
    state: ReservationStateInterface,
    reservations: ReservationInterface[]
  ) {
    state.reservationsForPartnerAsHost = reservations;
  },
  SET_PARTNER_RESERVATIONS_AS_CUSTOMER(
    state: ReservationStateInterface,
    reservations: ReservationInterface[]
  ) {
    state.reservationsForPartnerAsCustomer = reservations;
  },
  SET_TO_ASSIGN_RESERVATIONS(
    state: ReservationStateInterface,
    reservations: ReservationInterface[]
  ) {
    state.reservationsToAssign = reservations;
  },
  SET_RESERVATION_WIZARD_STATE(
    state: ReservationStateInterface,
    wizardState: ReservationWizardStateInterface
  ) {
    state.reservationsWizardState = wizardState;
  },
};

export default mutation;
