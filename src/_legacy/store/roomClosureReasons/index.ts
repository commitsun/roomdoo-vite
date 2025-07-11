import type { Module } from 'vuex';
import type { RoomClosureReasonInterface } from '@/_legacy/interfaces/RoomClosureReasonInterface';
import type { StateInterface } from '../index';
import state from './state';
import actions from './actions';
import mutations from './mutations';

export interface RoomClosureReasonsStateInterface {
  roomClosureReasons: RoomClosureReasonInterface[];
}

const roomClosureReasonsModule: Module<RoomClosureReasonsStateInterface, StateInterface> = {
  namespaced: true,
  actions,
  mutations,
  state,
};

export default roomClosureReasonsModule;
