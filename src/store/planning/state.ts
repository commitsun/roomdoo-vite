import type { PlanningStateInterface } from '.';

function state(): PlanningStateInterface {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateStartRange = new Date(today);
  dateStartRange.setDate(dateStartRange.getDate() - 1);
  const dateEndRange = new Date(today);
  dateEndRange.setDate(dateEndRange.getDate() + 32);

  return {
    dateStart: dateStartRange,
    dateEnd: dateEndRange,

    alertsPerDay: [],
    dailyBillings: [],
    dailyFreeRooms: [],
    planning: [],
    planningHeaders: [],
    planningPricesRules: [],

    reservationLines: [],
    filteredRoomIds: [],
    movePlanningToSelectedReservation: false,
  };
}

export default state;
