import type { Module } from 'vuex';
import type { DashboardReservationsInterface } from '@/legacy/interfaces/DashboardReservationsInterface';
import type { DashboardStateRoomsInterface } from '@/legacy/interfaces/DashboardStateRoomsInterface';
import type { DashboardReservationsBySaleChannelInterface } from '@/legacy/interfaces/DashboardReservationsBySaleChannelInterface';
import type { DashboardOccupiedRoomsInterface } from '@/legacy/interfaces/DashboardOccupiedRoomsInterface';
import type { DashboardDailyBillingsInterface } from '@/legacy/interfaces/DashboardDailyBillingsInterface';
import type { DashboardRssPostInterface } from '@/legacy/interfaces/DashboardRssPostInterface';
import type { FolioInterface } from '@/legacy/interfaces/FolioInterface';
import type { StateInterface } from '../index';
import state from './state';
import actions from './actions';
import mutations from './mutations';

export interface DashboardStateInterface {
  pendingReservations: DashboardReservationsInterface[];
  stateRooms: DashboardStateRoomsInterface[];
  reservationsBySaleChannel: DashboardReservationsBySaleChannelInterface[];
  linearGraphOccupancy: DashboardOccupiedRoomsInterface[];
  linearGraphOccupancyComparative: DashboardOccupiedRoomsInterface[];
  linearGraphBilling: DashboardDailyBillingsInterface[];
  linearGraphBillingComparative: DashboardDailyBillingsInterface[];
  occupancyToday: number | null;
  occupancyLastWeek: number | null;
  occupancyLastYear: number | null;
  billingToday: number | null;
  billingLastWeek: number | null;
  billingLastYear: number | null;
  ADRToday: number | null;
  ADRLastWeek: number | null;
  ADRLastYear: number | null;
  RevPARToday: number | null;
  RevPARLastWeek: number | null;
  RevPARLastYear: number | null;
  newFoliosToday: number | null;
  newFoliosLastWeek: number | null;
  newFoliosLastYear: number | null;
  overnights: number | null;
  cancelledOvernights: number | null;
  overbookings: number | null;
  feedPosts: DashboardRssPostInterface[];
  lastReceivedFolios: FolioInterface[];
  numLastReceivedFolios: number;
}

const dashboardModule: Module<DashboardStateInterface, StateInterface> = {
  namespaced: true,
  actions,
  mutations,
  state,
};

export default dashboardModule;
