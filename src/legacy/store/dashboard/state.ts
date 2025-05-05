import type { DashboardStateInterface } from '.';

function state(): DashboardStateInterface {
  return {
    pendingReservations: [],
    stateRooms: [],
    reservationsBySaleChannel: [],
    linearGraphOccupancy: [],
    linearGraphOccupancyComparative: [],
    linearGraphBilling: [],
    linearGraphBillingComparative: [],
    occupancyToday: null,
    occupancyLastWeek: null,
    occupancyLastYear: null,
    billingToday: null,
    billingLastWeek: null,
    billingLastYear: null,
    ADRToday: null,
    ADRLastWeek: null,
    ADRLastYear: null,
    RevPARToday: null,
    RevPARLastWeek: null,
    RevPARLastYear: null,
    newFoliosToday: null,
    newFoliosLastWeek: null,
    newFoliosLastYear: null,
    overnights: null,
    cancelledOvernights: null,
    overbookings: null,
    feedPosts: [],
    lastReceivedFolios: [],
    numLastReceivedFolios: 0,
  };
}

export default state;
