import type { Module } from 'vuex';
import type { AmenityInterface } from '@/legacy/interfaces/AmenityInterface';
import type { StateInterface } from '../index';
import state from './state';
import actions from './actions';
import mutations from './mutations';

export interface AmenitiesStateInterface {
  amenities: AmenityInterface[];
}

const amenitiesModule: Module<AmenitiesStateInterface, StateInterface> = {
  namespaced: true,
  actions,
  mutations,
  state,
};

export default amenitiesModule;
