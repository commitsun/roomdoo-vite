import type { ActionTree } from 'vuex';
import type { AxiosResponse } from 'axios';
import type { UsersInterface } from '@/legacy/interfaces/UsersInterface';
import { api } from '@/plugins/axios';

import type { StateInterface } from '../index';
import type { UsersStateInterface } from '.';

const actions: ActionTree<UsersStateInterface, StateInterface> = {
  async fetchUsers(context, propertyId: number) {
    return api
      .get(`properties/${propertyId}/users`)
      .then((response: AxiosResponse<UsersInterface[]>) => {
        context.commit('SET_USERS', response.data);
      });
  },
};

export default actions;
