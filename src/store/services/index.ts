import type { Module } from 'vuex';
import type { ServiceInterface } from 'src/interfaces/ServiceInterface';
import type { StateInterface } from '../index';
import state from './state';
import actions from './actions';
import mutations from './mutations';

export interface ServiceStateInterface {
  services: ServiceInterface[];
  folioServices: ServiceInterface[];
}

const servicesModule: Module<ServiceStateInterface, StateInterface> = {
  namespaced: true,
  actions,
  mutations,
  state,
};

export default servicesModule;
