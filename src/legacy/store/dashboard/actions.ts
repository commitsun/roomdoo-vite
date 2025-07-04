import type { ActionTree } from 'vuex';
import type { AxiosResponse } from 'axios';
import type { DashboardReservationsInterface } from '@/legacy/interfaces/DashboardReservationsInterface';
import type { PayloadDashboardRangeDatesInterface } from '@/legacy/interfaces/PayloadDashboardRangeDatesInterface';
import type { PayloadDashboardInterface } from '@/legacy/interfaces/PayloadDashboardInterface';
import type { DashboardNumericResponseInterface } from '@/legacy/interfaces/DashboardNumericResponseInterface';
import utils from '@/legacy/utils/dates';
import type { DashboardStateRoomsInterface } from '@/legacy/interfaces/DashboardStateRoomsInterface';
import type { DashboardOccupiedRoomsInterface } from '@/legacy/interfaces/DashboardOccupiedRoomsInterface';
import type { DashboardDailyBillingsInterface } from '@/legacy/interfaces/DashboardDailyBillingsInterface';
import type { DashboardRssPostInterface } from '@/legacy/interfaces/DashboardRssPostInterface';
import type { FolioInterface } from '@/legacy/interfaces/FolioInterface';
import { api } from '@/legacy/http/axios';

import type { StateInterface } from '../index';
import type { DashboardStateInterface } from '.';

const actions: ActionTree<DashboardStateInterface, StateInterface> = {
  async fetchPendingReservations(context, payload: PayloadDashboardRangeDatesInterface) {
    let params = `?pmsPropertyId=${payload.pmsPropertyId}`;
    const from = `${payload.dateFrom.getFullYear()}-${(payload.dateFrom.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${payload.dateFrom.getDate().toString().padStart(2, '0')}`;
    const to = `${payload.dateTo.getFullYear()}-${(payload.dateTo.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${payload.dateTo.getDate().toString().padStart(2, '0')}`;
    params += `&dateFrom=${from}&dateTo=${to}`;
    return api
      .get(`/dashboard/pending-reservations${params}`)
      .then((response: AxiosResponse<DashboardReservationsInterface[]>) => {
        context.commit('SET_DASHBOARD_PENDING_RESERVATIONS', response.data);
      });
  },
  async fetchStateRooms(context, payload: PayloadDashboardRangeDatesInterface) {
    let params = `?pmsPropertyId=${payload.pmsPropertyId}`;
    const from = `${payload.dateFrom.getFullYear()}-${(payload.dateFrom.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${payload.dateFrom.getDate().toString().padStart(2, '0')}`;
    const to = `${payload.dateTo.getFullYear()}-${(payload.dateTo.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${payload.dateTo.getDate().toString().padStart(2, '0')}`;
    params += `&dateFrom=${from}&dateTo=${to}`;
    return api
      .get(`/dashboard/state-rooms${params}`)
      .then((response: AxiosResponse<DashboardStateRoomsInterface[]>) => {
        context.commit('SET_DASHBOARD_STATE_ROOMS', response.data);
      });
  },
  async fetchOccupiedRooms(context, payload: PayloadDashboardRangeDatesInterface) {
    let params = `?pmsPropertyId=${payload.pmsPropertyId}`;
    const from = `${payload.dateFrom.getFullYear()}-${(payload.dateFrom.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${payload.dateFrom.getDate().toString().padStart(2, '0')}`;
    const to = `${payload.dateTo.getFullYear()}-${(payload.dateTo.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${payload.dateTo.getDate().toString().padStart(2, '0')}`;
    params += `&dateFrom=${from}&dateTo=${to}`;
    return api
      .get(`/dashboard/occupied-rooms${params}`)
      .then((response: AxiosResponse<DashboardOccupiedRoomsInterface[]>) => {
        context.commit('SET_DASHBOARD_OCCUPIED_ROOMS', response.data);
      });
  },
  async fetchOccupiedRoomsComparative(context, payload: PayloadDashboardRangeDatesInterface) {
    let params = `?pmsPropertyId=${payload.pmsPropertyId}`;
    const from = `${payload.dateFrom.getFullYear()}-${(payload.dateFrom.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${payload.dateFrom.getDate().toString().padStart(2, '0')}`;
    const to = `${payload.dateTo.getFullYear()}-${(payload.dateTo.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${payload.dateTo.getDate().toString().padStart(2, '0')}`;
    params += `&dateFrom=${from}&dateTo=${to}`;
    return api
      .get(`/dashboard/occupied-rooms${params}`)
      .then((response: AxiosResponse<DashboardOccupiedRoomsInterface[]>) => {
        context.commit('SET_DASHBOARD_OCCUPIED_ROOMS_COMPARATIVE', response.data);
      });
  },
  async fetchDailyBillings(context, payload: PayloadDashboardRangeDatesInterface) {
    let params = `?pmsPropertyId=${payload.pmsPropertyId}`;
    const from = `${payload.dateFrom.getFullYear()}-${(payload.dateFrom.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${payload.dateFrom.getDate().toString().padStart(2, '0')}`;
    const to = `${payload.dateTo.getFullYear()}-${(payload.dateTo.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${payload.dateTo.getDate().toString().padStart(2, '0')}`;
    params += `&dateFrom=${from}&dateTo=${to}`;
    return api
      .get(`/dashboard/daily-billings${params}`)
      .then((response: AxiosResponse<DashboardDailyBillingsInterface[]>) => {
        context.commit('SET_DASHBOARD_DAILY_BILLINGS', response.data);
      });
  },
  async fetchDailyBillingsComparative(context, payload: PayloadDashboardRangeDatesInterface) {
    let params = `?pmsPropertyId=${payload.pmsPropertyId}`;
    const from = `${payload.dateFrom.getFullYear()}-${(payload.dateFrom.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${payload.dateFrom.getDate().toString().padStart(2, '0')}`;
    const to = `${payload.dateTo.getFullYear()}-${(payload.dateTo.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${payload.dateTo.getDate().toString().padStart(2, '0')}`;
    params += `&dateFrom=${from}&dateTo=${to}`;
    return api
      .get(`/dashboard/daily-billings${params}`)
      .then((response: AxiosResponse<DashboardDailyBillingsInterface[]>) => {
        context.commit('SET_DASHBOARD_DAILY_BILLINGS_COMPARATIVE', response.data);
      });
  },
  async fetchReservationsBySaleChannel(context, payload: PayloadDashboardRangeDatesInterface) {
    let params = `?pmsPropertyId=${payload.pmsPropertyId}`;
    const from = `${payload.dateFrom.getFullYear()}-${(payload.dateFrom.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${payload.dateFrom.getDate().toString().padStart(2, '0')}`;
    const to = `${payload.dateTo.getFullYear()}-${(payload.dateTo.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${payload.dateTo.getDate().toString().padStart(2, '0')}`;
    params += `&dateFrom=${from}&dateTo=${to}`;
    return api
      .get(`/dashboard/reservations-by-sale-channel${params}`)
      .then((response: AxiosResponse<DashboardStateRoomsInterface[]>) => {
        context.commit('SET_DASHBOARD_RESERVATIONS_BY_SALE_CHANNEL', response.data);
      });
  },
  async fetchOccupancy(context, payload: PayloadDashboardInterface) {
    const params = `?pmsPropertyId=${payload.pmsPropertyId}`;
    const dateLastWeek = new Date(payload.date);
    const dateLastYear = utils.lastYearCorrespondingDate(payload.date);
    dateLastWeek.setDate(dateLastWeek.getDate() - 7);
    const dateToday = `${payload.date.getFullYear()}-${(payload.date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${payload.date.getDate().toString().padStart(2, '0')}`;
    const dateLastWeekString = `${dateLastWeek.getFullYear()}-${(dateLastWeek.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${dateLastWeek.getDate().toString().padStart(2, '0')}`;
    const dateLastYearString = `${dateLastYear.getFullYear()}-${(dateLastYear.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${dateLastYear.getDate().toString().padStart(2, '0')}`;

    return Promise.all([
      api
        .get(`/dashboard/occupancy${params}&date=${dateToday}`)
        .then((response: AxiosResponse<DashboardNumericResponseInterface>) => {
          context.commit('SET_DASHBOARD_OCCUPANCY_TODAY', response.data.value);
        }),
      api
        .get(`/dashboard/occupancy${params}&date=${dateLastWeekString}`)
        .then((response: AxiosResponse<DashboardNumericResponseInterface>) => {
          context.commit('SET_DASHBOARD_OCCUPANCY_LAST_WEEK', response.data.value);
        }),
      api
        .get(`/dashboard/occupancy${params}&date=${dateLastYearString}`)
        .then((response: AxiosResponse<DashboardNumericResponseInterface>) => {
          context.commit('SET_DASHBOARD_OCCUPANCY_LAST_YEAR', response.data.value);
        }),
    ]);
  },
  async fetchBilling(context, payload: PayloadDashboardInterface) {
    const params = `?pmsPropertyId=${payload.pmsPropertyId}`;
    const dateLastWeek = new Date(payload.date);
    const dateLastYear = utils.lastYearCorrespondingDate(payload.date);
    dateLastWeek.setDate(dateLastWeek.getDate() - 7);
    const dateToday = `${payload.date.getFullYear()}-${(payload.date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${payload.date.getDate().toString().padStart(2, '0')}`;
    const dateLastWeekString = `${dateLastWeek.getFullYear()}-${(dateLastWeek.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${dateLastWeek.getDate().toString().padStart(2, '0')}`;
    const dateLastYearString = `${dateLastYear.getFullYear()}-${(dateLastYear.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${dateLastYear.getDate().toString().padStart(2, '0')}`;

    return Promise.all([
      api
        .get(`/dashboard/billing${params}&date=${dateToday}`)
        .then((response: AxiosResponse<DashboardNumericResponseInterface>) => {
          context.commit('SET_DASHBOARD_BILLING_TODAY', response.data.value);
        }),
      api
        .get(`/dashboard/billing${params}&date=${dateLastWeekString}`)
        .then((response: AxiosResponse<DashboardNumericResponseInterface>) => {
          context.commit('SET_DASHBOARD_BILLING_LAST_WEEK', response.data.value);
        }),
      api
        .get(`/dashboard/billing${params}&date=${dateLastYearString}`)
        .then((response: AxiosResponse<DashboardNumericResponseInterface>) => {
          context.commit('SET_DASHBOARD_BILLING_LAST_YEAR', response.data.value);
        }),
    ]);
  },
  async fetchAdr(context, payload: PayloadDashboardRangeDatesInterface) {
    const params = `?pmsPropertyId=${payload.pmsPropertyId}`;

    const dateLastWeekFrom = utils.getLastMondayOfLastWeek();
    const dateLastWeekTo = new Date(dateLastWeekFrom);
    dateLastWeekTo.setDate(dateLastWeekFrom.getDate() + 6);

    const dateLastYearFrom = new Date(payload.dateFrom.getFullYear() - 1, 0, 1);
    const dateLastYearTo = new Date(payload.dateTo.getFullYear() - 1, 11, 31);

    const dateFromString = `${payload.dateFrom.getFullYear()}-${(payload.dateFrom.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${payload.dateFrom.getDate().toString().padStart(2, '0')}`;
    const dateToString = `${payload.dateTo.getFullYear()}-${(payload.dateTo.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${payload.dateTo.getDate().toString().padStart(2, '0')}`;

    const dateLastWeekFromString = `${dateLastWeekFrom.getFullYear()}-${(
      dateLastWeekFrom.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}-${dateLastWeekFrom.getDate().toString().padStart(2, '0')}`;
    const dateLastWeekToString = `${dateLastWeekTo.getFullYear()}-${(dateLastWeekTo.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${dateLastWeekTo.getDate().toString().padStart(2, '0')}`;

    const dateLastYearFromString = `${dateLastYearFrom.getFullYear()}-${(
      dateLastYearFrom.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}-${dateLastYearFrom.getDate().toString().padStart(2, '0')}`;
    const dateLastYearToString = `${dateLastYearTo.getFullYear()}-${(dateLastYearTo.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${dateLastYearTo.getDate().toString().padStart(2, '0')}`;

    return Promise.all([
      api
        .get(`/dashboard/adr${params}&dateFrom=${dateFromString}&dateTo=${dateToString}`)
        .then((response: AxiosResponse<DashboardNumericResponseInterface>) => {
          context.commit('SET_DASHBOARD_ADR_TODAY', response.data.value);
        }),
      api
        .get(
          `/dashboard/adr${params}&dateFrom=${dateLastWeekFromString}&dateTo=${dateLastWeekToString}`
        )
        .then((response: AxiosResponse<DashboardNumericResponseInterface>) => {
          context.commit('SET_DASHBOARD_ADR_LAST_WEEK', response.data.value);
        }),
      api
        .get(
          `/dashboard/adr${params}&dateFrom=${dateLastYearFromString}&dateTo=${dateLastYearToString}`
        )
        .then((response: AxiosResponse<DashboardNumericResponseInterface>) => {
          context.commit('SET_DASHBOARD_ADR_LAST_YEAR', response.data.value);
        }),
    ]);
  },
  async fetchRevpar(context, payload: PayloadDashboardRangeDatesInterface) {
    const params = `?pmsPropertyId=${payload.pmsPropertyId}`;

    const dateLastWeekFrom = utils.getLastMondayOfLastWeek();
    const dateLastWeekTo = new Date(dateLastWeekFrom);
    dateLastWeekTo.setDate(dateLastWeekFrom.getDate() + 6);

    const dateLastYearFrom = new Date(payload.dateFrom.getFullYear() - 1, 0, 1);
    const dateLastYearTo = new Date(payload.dateTo.getFullYear() - 1, 11, 31);

    const dateFromString = `${payload.dateFrom.getFullYear()}-${(payload.dateFrom.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${payload.dateFrom.getDate().toString().padStart(2, '0')}`;
    const dateToString = `${payload.dateTo.getFullYear()}-${(payload.dateTo.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${payload.dateTo.getDate().toString().padStart(2, '0')}`;

    const dateLastWeekFromString = `${dateLastWeekFrom.getFullYear()}-${(
      dateLastWeekFrom.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}-${dateLastWeekFrom.getDate().toString().padStart(2, '0')}`;
    const dateLastWeekToString = `${dateLastWeekTo.getFullYear()}-${(dateLastWeekTo.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${dateLastWeekTo.getDate().toString().padStart(2, '0')}`;

    const dateLastYearFromString = `${dateLastYearFrom.getFullYear()}-${(
      dateLastYearFrom.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}-${dateLastYearFrom.getDate().toString().padStart(2, '0')}`;
    const dateLastYearToString = `${dateLastYearTo.getFullYear()}-${(dateLastYearTo.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${dateLastYearTo.getDate().toString().padStart(2, '0')}`;

    return Promise.all([
      api
        .get(`/dashboard/revpar${params}&dateFrom=${dateFromString}&dateTo=${dateToString}`)
        .then((response: AxiosResponse<DashboardNumericResponseInterface>) => {
          context.commit('SET_DASHBOARD_REVPAR_TODAY', response.data.value);
        }),
      api
        .get(
          `/dashboard/revpar${params}&dateFrom=${dateLastWeekFromString}&dateTo=${dateLastWeekToString}`
        )
        .then((response: AxiosResponse<DashboardNumericResponseInterface>) => {
          context.commit('SET_DASHBOARD_REVPAR_LAST_WEEK', response.data.value);
        }),
      api
        .get(
          `/dashboard/revpar${params}&dateFrom=${dateLastYearFromString}&dateTo=${dateLastYearToString}`
        )
        .then((response: AxiosResponse<DashboardNumericResponseInterface>) => {
          context.commit('SET_DASHBOARD_REVPAR_LAST_YEAR', response.data.value);
        }),
    ]);
  },
  async fetchNewFolios(context, payload: PayloadDashboardInterface) {
    const params = `?pmsPropertyId=${payload.pmsPropertyId}`;
    const dateLastWeek = new Date(payload.date);
    const dateLastYear = utils.lastYearCorrespondingDate(payload.date);
    dateLastWeek.setDate(dateLastWeek.getDate() - 7);
    const dateToday = `${payload.date.getFullYear()}-${(payload.date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${payload.date.getDate().toString().padStart(2, '0')}`;
    const dateLastWeekString = `${dateLastWeek.getFullYear()}-${(dateLastWeek.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${dateLastWeek.getDate().toString().padStart(2, '0')}`;
    const dateLastYearString = `${dateLastYear.getFullYear()}-${(dateLastYear.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${dateLastYear.getDate().toString().padStart(2, '0')}`;

    return Promise.all([
      api
        .get(`/dashboard/new-folios${params}&date=${dateToday}`)
        .then((response: AxiosResponse<DashboardNumericResponseInterface>) => {
          context.commit('SET_DASHBOARD_NEW_FOLIOS_TODAY', response.data.value);
        }),
      api
        .get(`/dashboard/new-folios${params}&date=${dateLastWeekString}`)
        .then((response: AxiosResponse<DashboardNumericResponseInterface>) => {
          context.commit('SET_DASHBOARD_NEW_FOLIOS_LAST_WEEK', response.data.value);
        }),
      api
        .get(`/dashboard/new-folios${params}&date=${dateLastYearString}`)
        .then((response: AxiosResponse<DashboardNumericResponseInterface>) => {
          context.commit('SET_DASHBOARD_NEW_FOLIOS_LAST_YEAR', response.data.value);
        }),
    ]);
  },
  async fetchOvernights(context, payload: PayloadDashboardInterface) {
    let params = `?pmsPropertyId=${payload.pmsPropertyId}`;

    const dateToday = `${payload.date.getFullYear()}-${(payload.date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${payload.date.getDate().toString().padStart(2, '0')}`;
    params += `&date=${dateToday}`;
    return api
      .get(`/dashboard/overnights${params}`)
      .then((response: AxiosResponse<DashboardNumericResponseInterface>) => {
        context.commit('SET_DASHBOARD_OVERNIGHTS_TODAY', response.data.value);
      });
  },
  async fetchCancelledOvernights(context, payload: PayloadDashboardInterface) {
    let params = `?pmsPropertyId=${payload.pmsPropertyId}`;

    const dateToday = `${payload.date.getFullYear()}-${(payload.date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${payload.date.getDate().toString().padStart(2, '0')}`;
    params += `&date=${dateToday}`;
    return api
      .get(`/dashboard/cancelled-overnights${params}`)
      .then((response: AxiosResponse<DashboardNumericResponseInterface>) => {
        context.commit('SET_DASHBOARD_CANCELLED_OVERNIGHTS_TODAY', response.data.value);
      });
  },
  async fetchOverbookings(context, payload: PayloadDashboardInterface) {
    let params = `?pmsPropertyId=${payload.pmsPropertyId}`;

    const dateToday = `${payload.date.getFullYear()}-${(payload.date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${payload.date.getDate().toString().padStart(2, '0')}`;
    params += `&date=${dateToday}`;
    return api
      .get(`/dashboard/overbookings${params}`)
      .then((response: AxiosResponse<DashboardNumericResponseInterface>) => {
        context.commit('SET_DASHBOARD_OVERBOOKINGS_TODAY', response.data.value);
      });
  },
  async fetchFeedPosts(context) {
    return api.get('/feed-posts').then((response: AxiosResponse<DashboardRssPostInterface>) => {
      context.commit('SET_DASHBOARD_FEED_POSTS', response.data);
    });
  },
  async fetchLastReceivedFolios(
    context,
    payload: { pmsPropertyId: number; limit: number; offset: number }
  ) {
    return api
      .get(
        `/dashboard/last-received-folios?pmsPropertyId=${payload.pmsPropertyId}&limit=${payload.limit}&offset=${payload.offset}`
      )
      .then((response: AxiosResponse<FolioInterface[]>) => {
        context.commit('SET_DASHBOARD_LAST_RECEIVED_FOLIOS', response.data);
      });
  },
  async fetchNumLastReceivedFolios(context, pmsPropertyId: number) {
    return api
      .get(`/dashboard/num-last-received-folios?pmsPropertyId=${pmsPropertyId}`)
      .then((response: AxiosResponse<number>) => {
        context.commit('SET_DASHBOARD_NUM_LAST_RECEIVED_FOLIOS', response.data);
      });
  },
};

export default actions;
