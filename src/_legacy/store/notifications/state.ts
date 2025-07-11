import type { NotificationsStateInterface } from '.';

function state(): NotificationsStateInterface {
  return {
    notifications: [],
    numReservationsToAssign: 0,
  };
}

export default state;
