import type { Module } from 'vuex';
import type { UbicationInterface } from '@/legacy/interfaces/UbicationInterface';
import type { StateInterface } from '../index';
import state from './state';
import actions from './actions';
import mutations from './mutations';

export interface UbicationStateInterface {
  ubications: UbicationInterface[];
}

const ubicationModule: Module<UbicationStateInterface, StateInterface> = {
  namespaced: true,
  actions,
  mutations,
  state,
};

export default ubicationModule;
