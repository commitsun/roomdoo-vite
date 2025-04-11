import type { Module } from 'vuex';
import type { ReservationLineInterface } from 'src/interfaces/ReservationLineInterface';
import type { StateInterface } from '../index';
import state from './state';
import actions from './actions';
import mutations from './mutations';

export interface ReservationLinesStateInterface {
  reservationLines: ReservationLineInterface[];
}

const reservationLinesModule: Module<ReservationLinesStateInterface, StateInterface> = {
  namespaced: true,
  actions,
  mutations,
  state,
};

export default reservationLinesModule;
