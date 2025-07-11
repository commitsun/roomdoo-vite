import type { Module } from 'vuex';
import type { BoardServiceLineInterface } from '@/_legacy/interfaces/BoardServiceLineInterface';
import type { StateInterface } from '../index';
import state from './state';
import actions from './actions';
import mutations from './mutations';

export interface BoardServiceLinesStateInterface {
  boardServiceLines: BoardServiceLineInterface[];
}

const boardServiceLinesModule: Module<BoardServiceLinesStateInterface, StateInterface> = {
  namespaced: true,
  actions,
  mutations,
  state,
};

export default boardServiceLinesModule;
