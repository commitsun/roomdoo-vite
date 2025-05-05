import type { Module } from 'vuex';
import type { RoomTypeClassInterface } from '@/legacy/interfaces/RoomTypeClassInterface';
import type { StateInterface } from '../index';
import state from './state';
import actions from './actions';
import mutations from './mutations';

export interface RoomTypeClassStateInterface {
  roomTypeClasses: RoomTypeClassInterface[];
}

const roomTypeClassModule: Module<RoomTypeClassStateInterface, StateInterface> = {
  namespaced: true,
  actions,
  mutations,
  state,
};

export default roomTypeClassModule;
