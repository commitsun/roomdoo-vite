import type { MutationTree } from 'vuex';
import type { DashboardReservationsInterface } from 'src/interfaces/DashboardReservationsInterface';
import type { DashboardStateRoomsInterface } from 'src/interfaces/DashboardStateRoomsInterface';
import type { DashboardReservationsBySaleChannelInterface } from 'src/interfaces/DashboardReservationsBySaleChannelInterface';
import type { DashboardOccupiedRoomsInterface } from 'src/interfaces/DashboardOccupiedRoomsInterface';
import type { DashboardDailyBillingsInterface } from 'src/interfaces/DashboardDailyBillingsInterface';
import type { DashboardRssPostInterface } from 'src/interfaces/DashboardRssPostInterface';
import type { FolioInterface } from 'src/interfaces/FolioInterface';
import type { DashboardStateInterface } from '.';

const mutation: MutationTree<DashboardStateInterface> = {
  SET_DASHBOARD_PENDING_RESERVATIONS(
    state: DashboardStateInterface,
    reservations: DashboardReservationsInterface[],
  ) {
    reservations.forEach((reservation: DashboardReservationsInterface) => {
      reservation.date = new Date(reservation.date);
    });
    state.pendingReservations = reservations.sort((a, b) => {
      if (new Date(a.date).getTime() < new Date(b.date).getTime()) {
        return -1;
      }
      return 1;
    });
  },
  SET_DASHBOARD_STATE_ROOMS(
    state: DashboardStateInterface,
    stateRooms: DashboardStateRoomsInterface[],
  ) {
    stateRooms.forEach((stateRoom: DashboardStateRoomsInterface) => {
      stateRoom.date = new Date(stateRoom.date);
    });
    state.stateRooms = stateRooms.sort((a, b) => {
      if (new Date(a.date).getTime() < new Date(b.date).getTime()) {
        return -1;
      }
      return 1;
    });
  },
  SET_DASHBOARD_OCCUPIED_ROOMS(
    state: DashboardStateInterface,
    occupiedRooms: DashboardOccupiedRoomsInterface[],
  ) {
    occupiedRooms.forEach((occupiedRoom: DashboardOccupiedRoomsInterface) => {
      occupiedRoom.date = new Date(occupiedRoom.date);
    });
    state.linearGraphOccupancy = occupiedRooms.sort((a, b) => {
      if (new Date(a.date).getTime() < new Date(b.date).getTime()) {
        return -1;
      }
      return 1;
    });
  },
  SET_DASHBOARD_OCCUPIED_ROOMS_COMPARATIVE(
    state: DashboardStateInterface,
    occupiedRooms: DashboardOccupiedRoomsInterface[],
  ) {
    occupiedRooms.forEach((occupiedRoom: DashboardOccupiedRoomsInterface) => {
      occupiedRoom.date = new Date(occupiedRoom.date);
    });
    state.linearGraphOccupancyComparative = occupiedRooms.sort((a, b) => {
      if (new Date(a.date).getTime() < new Date(b.date).getTime()) {
        return -1;
      }
      return 1;
    });
  },
  SET_DASHBOARD_DAILY_BILLINGS(
    state: DashboardStateInterface,
    dailyBillings: DashboardDailyBillingsInterface[],
  ) {
    dailyBillings.forEach((dailyBilling: DashboardDailyBillingsInterface) => {
      dailyBilling.date = new Date(dailyBilling.date);
    });
    state.linearGraphBilling = dailyBillings.sort((a, b) => {
      if (new Date(a.date).getTime() < new Date(b.date).getTime()) {
        return -1;
      }
      return 1;
    });
  },
  SET_DASHBOARD_DAILY_BILLINGS_COMPARATIVE(
    state: DashboardStateInterface,
    dailyBillings: DashboardDailyBillingsInterface[],
  ) {
    dailyBillings.forEach((dailyBilling: DashboardDailyBillingsInterface) => {
      dailyBilling.date = new Date(dailyBilling.date);
    });
    state.linearGraphBillingComparative = dailyBillings.sort((a, b) => {
      if (new Date(a.date).getTime() < new Date(b.date).getTime()) {
        return -1;
      }
      return 1;
    });
  },
  SET_DASHBOARD_RESERVATIONS_BY_SALE_CHANNEL(
    state: DashboardStateInterface,
    reservationsBySaleChannel: DashboardReservationsBySaleChannelInterface[],
  ) {
    state.reservationsBySaleChannel = reservationsBySaleChannel;
  },
  SET_DASHBOARD_OCCUPANCY_TODAY(state: DashboardStateInterface, occupancyToday: number) {
    state.occupancyToday = occupancyToday;
  },
  SET_DASHBOARD_OCCUPANCY_LAST_WEEK(state: DashboardStateInterface, occupancyLastWeek: number) {
    state.occupancyLastWeek = occupancyLastWeek;
  },
  SET_DASHBOARD_OCCUPANCY_LAST_YEAR(state: DashboardStateInterface, occupancyLastYear: number) {
    state.occupancyLastYear = occupancyLastYear;
  },
  SET_DASHBOARD_BILLING_TODAY(state: DashboardStateInterface, billingToday: number) {
    state.billingToday = billingToday;
  },
  SET_DASHBOARD_BILLING_LAST_WEEK(state: DashboardStateInterface, billingLastWeek: number) {
    state.billingLastWeek = billingLastWeek;
  },
  SET_DASHBOARD_BILLING_LAST_YEAR(state: DashboardStateInterface, billingLastYear: number) {
    state.billingLastYear = billingLastYear;
  },
  SET_DASHBOARD_ADR_TODAY(state: DashboardStateInterface, ADRToday: number) {
    state.ADRToday = ADRToday;
  },
  SET_DASHBOARD_ADR_LAST_WEEK(state: DashboardStateInterface, ADRLastWeek: number) {
    state.ADRLastWeek = ADRLastWeek;
  },
  SET_DASHBOARD_ADR_LAST_YEAR(state: DashboardStateInterface, ADRLastYear: number) {
    state.ADRLastYear = ADRLastYear;
  },
  SET_DASHBOARD_REVPAR_TODAY(state: DashboardStateInterface, RevPARToday: number) {
    state.RevPARToday = RevPARToday;
  },
  SET_DASHBOARD_REVPAR_LAST_WEEK(state: DashboardStateInterface, RevPARLastWeek: number) {
    state.RevPARLastWeek = RevPARLastWeek;
  },
  SET_DASHBOARD_REVPAR_LAST_YEAR(state: DashboardStateInterface, RevPARLastYear: number) {
    state.RevPARLastYear = RevPARLastYear;
  },
  SET_DASHBOARD_NEW_FOLIOS_TODAY(state: DashboardStateInterface, newFoliosToday: number) {
    state.newFoliosToday = newFoliosToday;
  },
  SET_DASHBOARD_NEW_FOLIOS_LAST_WEEK(state: DashboardStateInterface, newFoliosLastWeek: number) {
    state.newFoliosLastWeek = newFoliosLastWeek;
  },
  SET_DASHBOARD_NEW_FOLIOS_LAST_YEAR(state: DashboardStateInterface, newFoliosLastYear: number) {
    state.newFoliosLastYear = newFoliosLastYear;
  },
  SET_DASHBOARD_OVERNIGHTS_TODAY(state: DashboardStateInterface, overnightsToday: number) {
    state.overnights = overnightsToday;
  },
  SET_DASHBOARD_CANCELLED_OVERNIGHTS_TODAY(
    state: DashboardStateInterface,
    cancelledOvernightsToday: number,
  ) {
    state.cancelledOvernights = cancelledOvernightsToday;
  },
  SET_DASHBOARD_OVERBOOKINGS_TODAY(state: DashboardStateInterface, overbookingToday: number) {
    state.overbookings = overbookingToday;
  },
  SET_DASHBOARD_FEED_POSTS(state: DashboardStateInterface, feedPosts: DashboardRssPostInterface[]) {
    state.feedPosts = feedPosts;
  },
  SET_DASHBOARD_LAST_RECEIVED_FOLIOS(state: DashboardStateInterface, folios: FolioInterface[]) {
    folios.forEach((folio: FolioInterface) => {
      if (folio.createDate) {
        folio.createDate = new Date(folio.createDate);
      }
    });
    state.lastReceivedFolios = folios;
  },
  SET_DASHBOARD_NUM_LAST_RECEIVED_FOLIOS(state: DashboardStateInterface, numFolios: number) {
    state.numLastReceivedFolios = numFolios;
  },
};

export default mutation;
