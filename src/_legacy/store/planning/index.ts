import type { Module } from 'vuex';
import type { DailyBillingInterface } from '@/_legacy/interfaces/DailyBillingInterface';
import type { DailyFreeRoomsInterface } from '@/_legacy/interfaces/DailyFreeRoomsInterface';
import type { AlertsPerDayInterface } from '@/_legacy/interfaces/AlertsPerDayInterface';
import type { PlanningReservationLineInterface } from '@/_legacy/interfaces/PlanningReservationLineInterface';
import type { AvailabilityPlanRuleInterface } from '@/_legacy/interfaces/AvailabilityPlanRuleInterface';
import type { StateInterface } from '../index';
import state from './state';
import actions from './actions';
import mutations from './mutations';

export interface PlanningInterface {
  roomId: number;
  capacity: number;
  roomTypeClassId: number;
  roomTypeId: number;
  dates: {
    date: Date;
    reservationLines: PlanningReservationLineInterface[];
    restriction: AvailabilityPlanRuleInterface | null;
  }[];
}
export interface PlanningPricesRulesInterface {
  roomTypeId: number;
  dates: {
    date: Date;
    freeRooms: number;
    pricelistItemId: number;
    availabilityPlanRuleId: number;
    price: number;
    maxAvail: number;
    quota: number;
    closed: boolean;
    closedArrival: boolean;
    closedDeparture: boolean;
    minStay: number;
    maxStay: number;
    minStayArrival: number;
    maxStayArrival: number;
  }[];
}

export interface PlanningHeaderInterface {
  date: Date;
  freeRooms: number;
  occupancyRate: number;
  dailyBilling: number;
  overbooking: boolean;
}

export interface PlanningStateInterface {
  reservationLines: PlanningReservationLineInterface[];
  dailyBillings: DailyBillingInterface[];
  dailyFreeRooms: DailyFreeRoomsInterface[];
  alertsPerDay: AlertsPerDayInterface[];
  dateStart: Date;
  dateEnd: Date;
  planning: PlanningInterface[];
  planningHeaders: PlanningHeaderInterface[];
  planningPricesRules: PlanningPricesRulesInterface[];
  filteredRoomIds: number[];
  movePlanningToSelectedReservation: boolean;
}

const planningModule: Module<PlanningStateInterface, StateInterface> = {
  namespaced: true,
  actions,
  mutations,
  state,
};

export default planningModule;
