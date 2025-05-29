import type { ActionTree } from 'vuex';
import { api } from '@/plugins/axios';
import type { AxiosResponse } from 'axios';
import type { ReservationInterface } from '@/legacy/interfaces/ReservationInterface';
import type { PayloadChangeRoomInterface } from '@/legacy/interfaces/PayloadChangeRoomInterface';
import type { PayloadReservationChangeInterface } from '@/legacy/interfaces/PayloadReservationChangeInterface';
import type { PayloadTransactionReport } from '@/legacy/interfaces/PayloadTransactionReport';
import type { ReservationWizardStateInterface } from '@/legacy/interfaces/ReservationWizardStateInterface';
import type { StateInterface } from '../index';
import type { ReservationStateInterface } from '.';

const actions: ActionTree<ReservationStateInterface, StateInterface> = {
  async fetchReservations(context, folioId: number) {
    return api
      .get(`/folios/${folioId}/reservations`)
      .then((response: AxiosResponse<ReservationInterface[]>) => {
        context.commit('SET_RESERVATIONS', response.data);
      });
  },

  async fetchReservation(context, reservationId: number) {
    return api
      .get(`/reservations/${reservationId}`)
      .then((response: AxiosResponse<ReservationInterface[]>) => {
        context.commit('SET_CURRENT_RESERVATION', response.data);
      });
  },

  setCurrentReservation(context, reservation: ReservationInterface) {
    context.commit('SET_CURRENT_RESERVATION', reservation);
  },

  setCurrentReservations(context, reservations: ReservationInterface) {
    context.commit('SET_CURRENT_RESERVATIONS', reservations);
  },

  async updateReservationLineRoom(context, payload: PayloadChangeRoomInterface) {
    let reservationLineId = '';

    if (payload.reservationLineId) {
      reservationLineId = payload.reservationLineId.toString();
    }
    return api.patch(
      `/reservations/p/${payload.reservationId}/reservation-lines/${reservationLineId}`,
      {
        roomId: payload.roomId,
      }
    );
  },
  async updateReservationRoom(context, payload: PayloadChangeRoomInterface) {
    return api.patch(`/reservations/p/${payload.reservationId}`, {
      preferredRoomId: payload.roomId,
    });
  },
  async assignReservationRoom(context, payload: { reservationId: number; toAssign: boolean }) {
    return api.patch(`/reservations/p/${payload.reservationId}`, {
      toAssign: false,
    });
  },

  async checkoutReservation(context, payload: { reservationId: number; toCheckout: boolean }) {
    return api.patch(`/reservations/p/${payload.reservationId}`, {
      toCheckout: true,
    });
  },
  async undoOnboard(context, payload: { reservationId: number }) {
    return api.patch(`/reservations/p/${payload.reservationId}`, {
      undoOnboard: true,
    });
  },
  async updateReservation(context, payload: PayloadReservationChangeInterface) {
    const reservationLines = payload.reservationLines?.map((el) => ({
      date: `${(el.date as Date).getFullYear()}-${((el.date as Date).getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${(el.date as Date).getDate().toString().padStart(2, '0')}`,
      discount: el.discount,
      price: el.price,
      reservationId: el.reservationId,
      roomId: el.roomId,
      pmsPropertyId: el.pmsPropertyId,
    }));
    delete payload.reservationLines;
    let send = {};
    send = {
      reservationId: payload.reservationId,
      adults: payload.adults,
      children: payload.children,
      segmentationId: payload.segmentationId,
      boardServiceId: payload.boardServiceId,
      boardServices: payload.boardServices?.map((bs) => ({
        isBoardService: bs.isBoardService,
        boardServiceLineId: bs.boardServiceLineId,
        productId: bs.productId,
        serviceLines: bs.serviceLines.map((sl) => ({
          date: `${(sl.date as Date).getFullYear()}-${((sl.date as Date).getMonth() + 1)
            .toString()
            .padStart(2, '0')}-${(sl.date as Date).getDate().toString().padStart(2, '0')}`,
          discount: sl.discount,
          priceUnit: sl.priceUnit,
          quantity: sl.quantity,
        })),
      })),
      reservationLines,
      pricelistId: payload.pricelistId,
      roomTypeId: payload.roomTypeId,
    };
    if (payload.checkin) {
      const yearCheckin = payload.checkin.getFullYear();
      const monthCheckin = (payload.checkin.getMonth() + 1).toString().padStart(2, '0');
      const dateCheckin = payload.checkin.getDate().toString().padStart(2, '0');

      send = {
        ...send,
        checkin: `${yearCheckin}-${monthCheckin}-${dateCheckin}`,
      };
    }
    if (payload.checkout) {
      const yearCheckout = payload.checkout.getFullYear();
      const monthCheckout = (payload.checkout.getMonth() + 1).toString().padStart(2, '0');
      const dateCheckout = payload.checkout.getDate().toString().padStart(2, '0');
      send = {
        ...send,
        checkout: `${yearCheckout}-${monthCheckout}-${dateCheckout}`,
      };
    }
    if (payload.partnerName) {
      send = {
        ...send,
        partnerName: payload.partnerName,
      };
    }
    if (payload.partnerEmail) {
      send = {
        ...send,
        partnerEmail: payload.partnerEmail,
      };
    }
    if (payload.partnerPhone) {
      send = {
        ...send,
        partnerPhone: payload.partnerPhone,
      };
    }
    if (payload.partnerId) {
      send = {
        ...send,
        partnerId: payload.partnerId,
      };
    }
    return api.patch(`/reservations/p/${payload.reservationId}`, send);
  },

  async cancelReservation(context, payload: number) {
    return api.patch(`/reservations/p/${payload}?stateCode=cancel`);
  },

  async confirmReservation(context, payload: number) {
    return api.patch(`/reservations/p/${payload}?stateCode=confirm`);
  },

  async updateReservationPartnerRequests(
    context,
    payload: { reservationId: number; partnerRequests: string }
  ) {
    return api.patch(`/reservations/p/${payload.reservationId}`, payload);
  },

  async fetchReservationsForPartnerAsHost(context, partnerId: number) {
    const params = `?id=${partnerId}`;
    return api
      .get(`/reservations/partner-as-host${params}`)
      .then((response: AxiosResponse<ReservationInterface[]>) => {
        context.commit('SET_PARTNER_RESERVATIONS_AS_HOST', response.data);
      });
  },
  async fetchReservationsForPartnerAsCustomer(context, partnerId: number) {
    const params = `?id=${partnerId}`;
    return api
      .get(`/reservations/partner-as-customer${params}`)
      .then((response: AxiosResponse<ReservationInterface[]>) => {
        context.commit('SET_PARTNER_RESERVATIONS_AS_CUSTOMER', response.data);
      });
  },
  async fetchReservationsToAssign(context, pmsPropertyId: number) {
    return api
      .get(`/reservations?pmsPropertyId=${pmsPropertyId}&toAssign=true`)
      .then((response: AxiosResponse<ReservationInterface[]>) => {
        context.commit('SET_TO_ASSIGN_RESERVATIONS', response.data);
      });
  },
  async kellyReport(context, payload: PayloadTransactionReport) {
    let params = '';
    let to = '';
    let from = '';
    if (payload.pmsPropertyId) {
      params += `?pmsPropertyId=${payload.pmsPropertyId}`;
    }
    if (payload.dateFrom && payload.dateTo) {
      from = `${payload.dateFrom.getFullYear()}-${(payload.dateFrom.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${payload.dateFrom.getDate().toString().padStart(2, '0')}`;
      to = `${payload.dateTo.getFullYear()}-${(payload.dateTo.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${payload.dateTo.getDate().toString().padStart(2, '0')}`;
      params += `&dateFrom=${from}&dateTo=${to}`;
    }
    return api.get(`reservations/kelly-report${params}`);
  },
  async arrivalsReport(context, payload: PayloadTransactionReport) {
    let params = '';
    let to = '';
    let from = '';
    if (payload.pmsPropertyId) {
      params += `?pmsPropertyId=${payload.pmsPropertyId}`;
    }
    if (payload.dateFrom && payload.dateTo) {
      from = `${payload.dateFrom.getFullYear()}-${(payload.dateFrom.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${payload.dateFrom.getDate().toString().padStart(2, '0')}`;
      to = `${payload.dateTo.getFullYear()}-${(payload.dateTo.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${payload.dateTo.getDate().toString().padStart(2, '0')}`;
      params += `&dateFrom=${from}&dateTo=${to}`;
    }
    return api.get(`reservations/arrivals-report${params}`);
  },
  async departuresReport(context, payload: PayloadTransactionReport) {
    let params = '';
    let to = '';
    let from = '';
    if (payload.pmsPropertyId) {
      params += `?pmsPropertyId=${payload.pmsPropertyId}`;
    }
    if (payload.dateFrom && payload.dateTo) {
      from = `${payload.dateFrom.getFullYear()}-${(payload.dateFrom.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${payload.dateFrom.getDate().toString().padStart(2, '0')}`;
      to = `${payload.dateTo.getFullYear()}-${(payload.dateTo.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${payload.dateTo.getDate().toString().padStart(2, '0')}`;
      params += `&dateFrom=${from}&dateTo=${to}`;
    }
    return api.get(`reservations/departures-report${params}`);
  },
  async fetchReservationWizardState(context, reservationId: number) {
    return api
      .get(`reservations/${reservationId}/wizard-states`)
      .then((response: AxiosResponse<ReservationWizardStateInterface[]>) => {
        context.commit('SET_RESERVATION_WIZARD_STATE', response.data);
      });
  },
};

export default actions;
