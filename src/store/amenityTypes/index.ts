import type { Module } from 'vuex';
import type { AmenityTypeInterface } from '@/interfaces/AmenityTypeInterface';
import type { StateInterface } from '../index';
import state from './state';
import actions from './actions';
import mutations from './mutations';

export interface AmenityTypesStateInterface {
  amenityTypes: AmenityTypeInterface[];
}

const amenityTypesModule: Module<AmenityTypesStateInterface, StateInterface> = {
  namespaced: true,
  actions,
  mutations,
  state,
};

export default amenityTypesModule;
