import type { ActionTree } from 'vuex';
import type { AxiosResponse } from 'axios';
import type { ReservationLineInterface } from '@/_legacy/interfaces/ReservationLineInterface';
import type { PayloadReservationDeletion } from '@/_legacy/interfaces/PayloadReservationDeletion';
import type { PayloadReservationCreation } from '@/_legacy/interfaces/PayloadReservationCreation';
import type { ReservationInterface } from '@/_legacy/interfaces/ReservationInterface';
import { api } from '@/_legacy/http/axios';

import type { StateInterface } from '../index';
import type { ReservationLinesStateInterface } from '.';

const actions: ActionTree<ReservationLinesStateInterface, StateInterface> = {
  async fetchReservationLines(context, reservationId: number) {
    return api
      .get(`/reservations/${reservationId}/reservation-lines`)
      .then((response: AxiosResponse<ReservationLineInterface[]>) => {
        context.commit('SET_RESERVATION_LINES', response.data);
      });
  },
  async fetchCurrentFolioReservationLines(context) {
    context.commit('CLEAR_RESERVATION_LINES');
    await context.rootState.reservations.reservations?.reduce(
      async (acc, res: ReservationInterface) => {
        await acc;
        await api
          .get(`/reservations/${res.id ?? 0}/reservation-lines`)
          .then((response: AxiosResponse<ReservationLineInterface[]>) => {
            context.commit('ADD_RESERVATION_LINES', response.data);
          });
      },
      undefined as unknown
    );
  },
  async deleteReservationLine(context, payload: PayloadReservationDeletion) {
    return api.delete(
      `/reservations/${payload.reservationId}/reservation-lines/${payload.reservationLineId}`
    );
  },
  async createReservationLine(context, payload: PayloadReservationCreation) {
    return api.post(`/reservations/${payload.reservationId}/reservation-lines`, payload);
  },
  async updateReservationLine(
    context,
    payload: { reservationLineId: number; isReselling: boolean }
  ) {
    return api.patch(`reservation-lines/p/${payload.reservationLineId}`, payload);
  },
};

export default actions;
