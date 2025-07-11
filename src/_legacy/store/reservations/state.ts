import type { ReservationStateInterface } from '.';

function state(): ReservationStateInterface {
  return {
    reservations: null,
    currentReservation: null,
    reservationsForPartnerAsHost: [],
    reservationsForPartnerAsCustomer: [],
    reservationsToAssign: [],
    reservationsWizardState: null,
  };
}

export default state;
