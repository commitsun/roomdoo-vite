import type { ActionTree } from 'vuex';
import type { AxiosResponse } from 'axios';

import type { DailyBillingInterface } from '@/interfaces/DailyBillingInterface';
import type { AlertsPerDayInterface } from '@/interfaces/AlertsPerDayInterface';
import type { PayloadReservationLineChangeInterface } from '@/interfaces/PayloadReservationLineChangeInterface';
import type { PayloadReservationFragmentSwap } from '@/interfaces/PayloadReservationFragmentSwap';
import type { DateRangeInterface } from '@/interfaces/DateRangeInterface';
import { api } from '@/plugins/axios';
import { ONE_DAY_IN_MS } from '../../utils/dates';

import type { StateInterface } from '../index';
import type { PlanningStateInterface, PlanningInterface, PlanningPricesRulesInterface } from '.';

const actions: ActionTree<PlanningStateInterface, StateInterface> = {
  async fetchPlanning(context, payload: DateRangeInterface) {
    let to = '';
    let from = '';
    let params = '';

    if (payload.dateStart && payload.dateEnd && payload.propertyId && payload.availabilityPlanId) {
      from = `${payload.dateStart.getFullYear()}-${(payload.dateStart.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${payload.dateStart.getDate().toString().padStart(2, '0')}`;
      to = `${payload.dateEnd.getFullYear()}-${(payload.dateEnd.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${payload.dateEnd.getDate().toString().padStart(2, '0')}`;
      params = `?dateFrom=${from}&dateTo=${to}&pmsPropertyId=${payload.propertyId}&availabilityPlanId=${payload.availabilityPlanId}`;
    }
    return api.get(`/calendar${params}`).then((response: AxiosResponse<PlanningInterface[]>) => {
      context.commit('SET_PLANNING', response.data);
    });
  },

  async fetchPlanningHeaders(context, payload: DateRangeInterface) {
    let to = '';
    let from = '';
    let params = '';
    if (payload.dateStart && payload.dateEnd && payload.roomIds && payload.propertyId) {
      from = `${payload.dateStart.getFullYear()}-${(payload.dateStart.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${payload.dateStart.getDate().toString().padStart(2, '0')}`;
      to = `${payload.dateEnd.getFullYear()}-${(payload.dateEnd.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${payload.dateEnd.getDate().toString().padStart(2, '0')}`;
      params = `?dateFrom=${from}&dateTo=${to}&pmsPropertyId=${payload.propertyId}`;
      payload.roomIds.forEach((roomId) => {
        params += `&roomIds[]=${roomId}`;
      });
    }
    return api
      .get(`/calendar/calendar-headers${params}`)
      .then((response: AxiosResponse<PlanningInterface[]>) => {
        context.commit('SET_PLANNING_HEADERS', response.data);
      });
  },

  async fetchPlanningPricesRules(context, payload: DateRangeInterface) {
    let to = '';
    let from = '';
    let params = '';

    if (
      payload.dateStart &&
      payload.dateEnd &&
      payload.propertyId &&
      payload.availabilityPlanId &&
      payload.pricelistId
    ) {
      from = `${payload.dateStart.getFullYear()}-${(payload.dateStart.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${payload.dateStart.getDate().toString().padStart(2, '0')}`;
      to = `${payload.dateEnd.getFullYear()}-${(payload.dateEnd.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${payload.dateEnd.getDate().toString().padStart(2, '0')}`;
      params = `?dateFrom=${from}&dateTo=${to}&pmsPropertyId=${payload.propertyId}&availabilityPlanId=${payload.availabilityPlanId}&pricelistId=${payload.pricelistId}`;
    }
    return api
      .get(`/calendar/calendar-prices-rules${params}`)
      .then((response: AxiosResponse<PlanningPricesRulesInterface[]>) => {
        context.commit('SET_PLANNING_PRICES_RULES', response.data);
      });
  },

  clearPlanningHeaders(context) {
    context.commit('CLEAR_PLANNING_HEADERS');
  },

  async updateReservationLines(context, payload: PayloadReservationLineChangeInterface) {
    // This method allows to move reservation fragment to an empty date or to
    // date occupied by the same reservation

    // get reservation id from first reservation line to change
    const { reservationId } = payload.reservationLines[0];

    // build new array of reservation line changes with the proper roomId & date
    // sorted by date asc
    const newOnes = payload.reservationLines
      .map((obj) => ({
        date: obj.date,
        id: obj.id,
        reservationId: obj.reservationId,
        roomId: payload.roomIdTarget,
      }))
      .sort((a, b) => {
        if (new Date(a.date).getTime() < new Date(b.date).getTime()) {
          return -1;
        }
        return 1;
      });

    const fakeDate = new Date(payload.dateTarget);
    fakeDate.setDate(fakeDate.getDate() - payload.moreDays);
    newOnes[0].date = new Date(fakeDate);

    newOnes.forEach((el, index) => {
      if (index > 0) {
        fakeDate.setTime(fakeDate.getTime() + ONE_DAY_IN_MS);
        el.date = new Date(fakeDate);
      }
    });

    const apiPayload: { date: string; roomId: number; reservationLineId: number }[] = [];

    newOnes.forEach((line) => {
      line.date = new Date(line.date);
      // build the api payload for updating all lines in block
      apiPayload.push({
        date: `${line.date.getFullYear()}-${(line.date.getMonth() + 1)
          .toString()
          .padStart(2, '0')}-${line.date.getDate().toString().padStart(2, '0')}`,
        roomId: line.roomId,
        reservationLineId: line.id,
      });
    });

    await api.patch(`/calendar/p/${reservationId}`, {
      reservationLinesChanges: apiPayload,
    });
  },

  setReservationLinesToOnBoard(context, reservationId: number) {
    context.state.reservationLines
      ?.filter((el) => el.reservationId === reservationId)
      ?.forEach((reservationLine) => {
        reservationLine.state = 'onboard';
        context.commit('UPDATE_RESERVATION_LINE_STATE', {
          reservationLineId: reservationLine.id,
          state: 'onboard',
        });
      });
  },

  setReservationLinesPendingPayment(context, payload: { folioId: number; pendingPayment: number }) {
    context.state.reservationLines
      ?.filter((el) => el.folioId === payload.folioId)
      ?.forEach((reservationLine) => {
        reservationLine.pendingPayment = payload.pendingPayment;
        context.commit('UPDATE_RESERVATION_LINE_PENDING_AMOUNT', {
          reservationLineId: reservationLine.id,
          pendingPayment: payload.pendingPayment,
        });
      });
  },

  async swapReservationLines(context, payload: PayloadReservationFragmentSwap) {
    const date = `${payload.date.getFullYear()}-${(payload.date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${payload.date.getDate().toString().padStart(2, '0')}`;

    const { roomId, pmsPropertyId, targetReservationLineIds } = payload;

    await api.post('calendar/swap', {
      pmsPropertyId,
      roomId,
      date,
      reservationLineIds: targetReservationLineIds,
    });
  },

  newReservationLines(context, payload: number) {
    context.commit('NEW_RESERVATION_LINE', payload);
  },

  deleteLastReservationLine(context, payload: number) {
    context.commit('DELETE_RESERVATION_LINE', payload);
  },

  updateDateStart(context, payload: Date) {
    const renderDateStart = new Date(payload);
    context.commit('UPDATE_DATE_START', renderDateStart);
  },

  updateDateEnd(context, payload: Date) {
    const renderDateEnd = new Date(payload);
    context.commit('UPDATE_DATE_END', renderDateEnd);
  },

  async fetchDailyBillings(context, payload: DateRangeInterface) {
    let to = '';
    let from = '';
    let params = '';

    if (payload.dateStart && payload.dateEnd) {
      from = `${payload.dateStart.getFullYear()}-${(payload.dateStart.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${payload.dateStart.getDate().toString().padStart(2, '0')}`;
      to = `${payload.dateEnd.getFullYear()}-${(payload.dateEnd.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${payload.dateEnd.getDate().toString().padStart(2, '0')}`;
      params = `?dateFrom=${from}&dateTo=${to}&pmsPropertyId=${payload.propertyId}`;
    }
    return api
      .get(`/calendar/daily-invoicing${params}`)
      .then((response: AxiosResponse<DailyBillingInterface[]>) => {
        context.commit('SET_DAILY_BILLINGS', response.data);
      });
  },

  async fetchDailyFreeRooms(context, payload: DateRangeInterface) {
    let to = '';
    let from = '';
    let params = '';

    if (payload.dateStart && payload.dateEnd) {
      from = `${payload.dateStart.getFullYear()}-${(payload.dateStart.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${payload.dateStart.getDate().toString().padStart(2, '0')}`;
      to = `${payload.dateEnd.getFullYear()}-${(payload.dateEnd.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${payload.dateEnd.getDate().toString().padStart(2, '0')}`;
      params = `?dateFrom=${from}&dateTo=${to}&pmsPropertyId=${payload.propertyId}`;
    }
    return api
      .get(`/calendar/free-rooms${params}`)
      .then((response: AxiosResponse<DailyBillingInterface[]>) => {
        context.commit('SET_DAILY_FREE_ROOMS', response.data);
      });
  },

  async fetchAlertsPerDay(context, payload: DateRangeInterface) {
    let to = '';
    let from = '';
    let params = '';

    if (payload.dateStart && payload.dateEnd) {
      from = `${payload.dateStart.getFullYear()}-${(payload.dateStart.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${payload.dateStart.getDate().toString().padStart(2, '0')}`;
      to = `${payload.dateEnd.getFullYear()}-${(payload.dateEnd.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${payload.dateEnd.getDate().toString().padStart(2, '0')}`;
      params = `?dateFrom=${from}&dateTo=${to}&pmsPropertyId=${payload.propertyId}`;
    }
    return api
      .get(`/calendar/alerts-per-day${params}`)
      .then((response: AxiosResponse<AlertsPerDayInterface[]>) => {
        context.commit('SET_ALERTS_PER_DAY', response.data);
      });
  },

  setFilteredRoomIds(context, payload: number[]) {
    context.commit('SET_FILTERED_ROOM_IDS', payload);
  },

  setMovePlanningToSelectedReservation(context, payload: boolean) {
    context.commit('SET_MOVE_PLANNING_TO_SELECTED_RESERVATION', payload);
  },
};

export default actions;
