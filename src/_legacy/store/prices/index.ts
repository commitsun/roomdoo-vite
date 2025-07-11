import type { Module } from 'vuex';

import type { PriceInterface } from '@/_legacy/interfaces/PriceInterface';
import type { StateInterface } from '../index';
import state from './state';
import actions from './actions';
import mutations from './mutations';

export interface PricesStateInterface {
  prices: PriceInterface[];
}

const pricesModule: Module<PricesStateInterface, StateInterface> = {
  namespaced: true,
  actions,
  mutations,
  state,
};

export default pricesModule;
