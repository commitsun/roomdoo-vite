import type { Module } from 'vuex';
import type { BoardServiceInterface } from '@/legacy/interfaces/BoardServiceInterface';
import type { StateInterface } from '../index';
import state from './state';
import actions from './actions';
import mutations from './mutations';

export interface BoardServicesStateInterface {
  boardServices: BoardServiceInterface[];
}

const boardServicesModule: Module<BoardServicesStateInterface, StateInterface> = {
  namespaced: true,
  actions,
  mutations,
  state,
};

export default boardServicesModule;
