import type { Module } from 'vuex';
import type { AddressInterface } from '@/interfaces/AddressInterface';
import type { StateInterface } from '../index';
import state from './state';
import actions from './actions';
import mutations from './mutations';

export interface AddressStateInterface {
  address: AddressInterface | null;
  addresess: AddressInterface[];
}

const productsModule: Module<AddressStateInterface, StateInterface> = {
  namespaced: true,
  actions,
  mutations,
  state,
};

export default productsModule;
