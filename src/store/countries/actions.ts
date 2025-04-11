import type { ActionTree } from 'vuex';
import { api } from '@/plugins/axios';
import type { CountryInterface } from '@/interfaces/CountryInterface';
import type { AxiosResponse } from 'axios';
import type { StateInterface } from '../index';
import type { CountryStateInterface } from '.';

const actions: ActionTree<CountryStateInterface, StateInterface> = {
  async fetchCountries(context) {
    return api.get('/countries').then((response: AxiosResponse<CountryInterface[]>) => {
      context.commit('SET_COUNTRIES', response.data);
    });
  },
};

export default actions;
