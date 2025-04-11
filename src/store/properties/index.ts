import type { Module } from 'vuex';
import type { PropertyInterface } from '@/interfaces/PropertyInterface';
import type { StateInterface } from '../index';
import state from './state';
import actions from './actions';
import mutations from './mutations';

export interface PropertyStateInterface {
  properties: PropertyInterface[];
  activeProperty: PropertyInterface | null;
}

const propertiesModule: Module<PropertyStateInterface, StateInterface> = {
  namespaced: true,
  actions,
  mutations,
  state,
};

export default propertiesModule;
