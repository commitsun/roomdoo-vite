import type { Module } from 'vuex';
import type { SaleChannelInterface } from '@/_legacy/interfaces/SaleChannelnterface';
import type { StateInterface } from '../index';
import state from './state';
import actions from './actions';
import mutations from './mutations';

export interface SaleChannelsStateInterface {
  saleChannels: SaleChannelInterface[];
}

const saleChannelsModule: Module<SaleChannelsStateInterface, StateInterface> = {
  namespaced: true,
  actions,
  mutations,
  state,
};

export default saleChannelsModule;
