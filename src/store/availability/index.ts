import type { Module } from 'vuex';
import type { AvailabilityInterface } from 'src/interfaces/AvailabilityInterface';
import type { StateInterface } from '../index';
import state from './state';
import actions from './actions';
import mutations from './mutations';

export interface AvailabilityStateInterface {
  availability: AvailabilityInterface[];
}

const productsModule: Module<AvailabilityStateInterface, StateInterface> = {
  namespaced: true,
  actions,
  mutations,
  state,
};

export default productsModule;
