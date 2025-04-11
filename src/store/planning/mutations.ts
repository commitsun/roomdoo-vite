import type { MutationTree } from 'vuex';

import type { DailyBillingInterface } from '@/interfaces/DailyBillingInterface';
import type { DailyFreeRoomsInterface } from '@/interfaces/DailyFreeRoomsInterface';
import type { AlertsPerDayInterface } from '@/interfaces/AlertsPerDayInterface';
import type { PayloadReservationLineChangeInterface } from '@/interfaces/PayloadReservationLineChangeInterface';
import type { PlanningReservationLineInterface } from '@/interfaces/PlanningReservationLineInterface';
import type {
  PlanningHeaderInterface,
  PlanningInterface,
  PlanningPricesRulesInterface,
  PlanningStateInterface,
} from '.';

const mutation: MutationTree<PlanningStateInterface> = {
  SET_PLANNING(state: PlanningStateInterface, planning: PlanningInterface[]) {
    planning.forEach((planningRow: PlanningInterface) => {
      planningRow.dates.forEach((date) => {
        date.date = new Date(date.date);
        date.reservationLines.forEach((reservationLine) => {
          reservationLine.date = new Date(reservationLine.date);
        });
      });
    });
    state.planning = planning;
  },

  SET_PLANNING_PRICES_RULES(
    state: PlanningStateInterface,
    planningPricesRules: PlanningPricesRulesInterface[]
  ) {
    planningPricesRules.forEach((planningRow: PlanningPricesRulesInterface) => {
      planningRow.dates.forEach((date) => {
        date.date = new Date(date.date);
      });
    });
    state.planningPricesRules = planningPricesRules;
  },

  SET_PLANNING_HEADERS(state: PlanningStateInterface, planningHeaders: PlanningHeaderInterface[]) {
    planningHeaders.forEach((header: PlanningHeaderInterface) => {
      header.date = new Date(header.date);
    });
    state.planningHeaders = planningHeaders;
  },

  CLEAR_PLANNING_HEADERS(state: PlanningStateInterface) {
    state.planningHeaders.forEach((header: PlanningHeaderInterface) => {
      header.dailyBilling = 0;
      header.freeRooms = 0;
      header.occupancyRate = 0;
      header.overbooking = false;
    });
  },

  SET_DAILY_BILLINGS(state: PlanningStateInterface, dailyBillings: DailyBillingInterface[]) {
    dailyBillings.forEach((day) => {
      day.date = new Date(day.date);
    });
    state.dailyBillings = dailyBillings;
  },

  SET_DAILY_FREE_ROOMS(state: PlanningStateInterface, dailyFreeRooms: DailyFreeRoomsInterface[]) {
    dailyFreeRooms.forEach((day) => {
      day.date = new Date(day.date);
    });
    state.dailyFreeRooms = dailyFreeRooms;
  },

  SET_ALERTS_PER_DAY(state: PlanningStateInterface, alertsPerDay: AlertsPerDayInterface[]) {
    alertsPerDay.forEach((day) => {
      day.date = new Date(day.date);
    });
    state.alertsPerDay = alertsPerDay;
  },

  SET_RESERVATION_LINES(
    state: PlanningStateInterface,
    payload: PayloadReservationLineChangeInterface
  ) {
    // get lines to move
    const newOnes = payload.reservationLines.map((obj: PlanningReservationLineInterface) => ({
      id: obj.id,
      roomId: obj.roomId,
      date: new Date(obj.date),
    }));
    newOnes.forEach((newOne) => {
      // look for lines that match the ones to move
      // i.e. those that have the same date as the ones to move
      // and the roomId equal to the target
      const indexOldOne = state.reservationLines.findIndex(
        (el: PlanningReservationLineInterface) =>
          el.roomId === payload.roomIdTarget && el.date === newOne.date
      );
      let tempDate;
      // if the movement requires to adjust old lines
      if (indexOldOne !== -1) {
        // adjust its roomId and date
        state.reservationLines[indexOldOne].roomId = newOne.roomId;
        state.reservationLines[indexOldOne].date = newOne.date;
        tempDate = state.reservationLines[indexOldOne].date;
      }
      const indexNewOne = state.reservationLines.findIndex((el) => el.id === newOne.id);
      state.reservationLines[indexNewOne].roomId = payload.roomIdTarget;
      if (tempDate) {
        state.reservationLines[indexNewOne].date = new Date(tempDate);
      }
    });
  },

  SET_FILTERED_ROOM_IDS(state: PlanningStateInterface, payload: number[]) {
    state.filteredRoomIds = payload;
  },

  UPDATE_RESERVATION_LINE_STATE(
    state: PlanningStateInterface,
    payload: {
      reservationLineId: number;
      state: string;
    }
  ) {
    const indexToModify = state.reservationLines.findIndex(
      (el) => el.id === payload.reservationLineId
    );
    if (indexToModify !== -1) {
      state.reservationLines[indexToModify].state = payload.state;
    }
  },

  UPDATE_RESERVATION_LINE_PENDING_AMOUNT(
    state: PlanningStateInterface,
    payload: {
      folioId: number;
      pendingPayment: number;
    }
  ) {
    const indexToModify = state.reservationLines.findIndex((el) => el.folioId === payload.folioId);
    if (indexToModify !== -1) {
      state.reservationLines[indexToModify].pendingPayment = payload.pendingPayment;
    }
  },

  UPDATE_DATE_START(state: PlanningStateInterface, payload: Date) {
    state.dateStart = payload;
  },

  UPDATE_DATE_END(state: PlanningStateInterface, payload: Date) {
    state.dateEnd = payload;
  },

  SET_MOVE_PLANNING_TO_SELECTED_RESERVATION(state: PlanningStateInterface, payload: boolean) {
    state.movePlanningToSelectedReservation = payload;
  },
};

export default mutation;
