import type { Module } from 'vuex';
import type { PricelistInterface } from '@/interfaces/PricelistInterface';
import type { PricelistItemInterface } from '@/interfaces/PricelistItemInterface';
import type { StateInterface } from '../index';
import state from './state';
import actions from './actions';
import mutations from './mutations';

export interface PricelistStateInterface {
  pricelists: PricelistInterface[];
  dailyPricelists: PricelistInterface[];
  activePricelist: PricelistInterface | null;
  pricelistItems: PricelistItemInterface[];
  restrictedPricelist: PricelistInterface | null;
}
const pricelistsModule: Module<PricelistStateInterface, StateInterface> = {
  namespaced: true,
  actions,
  mutations,
  state,
};

export default pricelistsModule;
