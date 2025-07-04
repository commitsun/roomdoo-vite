import type { ActionTree } from 'vuex';

import { api } from '@/legacy/http/axios';
import type { AxiosResponse } from 'axios';
import type { StateInterface } from '../index';
import type { NotificationsStateInterface } from '.';

const actions: ActionTree<NotificationsStateInterface, StateInterface> = {
  async fetchNotificationsReservationsToAssign(context, pmsPropertyId: number) {
    return api
      .get(`/notifications/reservations-to-assign?pmsPropertyId=${pmsPropertyId}`)
      .then((response: AxiosResponse<{ numReservationsToAssign: number }>) => {
        context.commit('SET_RESERVATIONS_TO_ASSIGN', response.data.numReservationsToAssign);
      });
  },
};

export default actions;
