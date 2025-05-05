import type { Module } from 'vuex';
import type { ExtraBedInterface } from '@/legacy/interfaces/ExtraBedInterface';
import type { StateInterface } from '../index';
import state from './state';
import actions from './actions';
import mutations from './mutations';

export interface ExtraBedsStateInterface {
  extraBeds: ExtraBedInterface[];
}

const extraBedsModule: Module<ExtraBedsStateInterface, StateInterface> = {
  namespaced: true,
  actions,
  mutations,
  state,
};

export default extraBedsModule;
