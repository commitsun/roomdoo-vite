import type { ActionTree } from 'vuex';
import { api } from '@/plugins/axios';
import type { CountryStatesInterface } from '@/legacy/interfaces/CountryStatesInterface';
import type { AxiosResponse } from 'axios';
import type { StateInterface } from '../index';
import type { CountryStatesStateInterface } from '.';

const actions: ActionTree<CountryStatesStateInterface, StateInterface> = {
  async fetchCountryStates(context, payload: number) {
    return api
      .get(`/countries/${payload}/country-states`)
      .then((response: AxiosResponse<CountryStatesInterface[]>) => {
        context.commit('SET_COUNTRY_STATES', response.data);
      });
  },
  removeCountryStates(context) {
    context.commit('REMOVE_COUNTRY_STATES');
  },
};

export default actions;
