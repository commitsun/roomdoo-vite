import type { Module } from 'vuex';
import type { RoomInterface } from '@/legacy/interfaces/RoomInterfaces';
import type { StateInterface } from '../index';
import state from './state';
import actions from './actions';
import mutations from './mutations';

export interface RoomsStateInterface {
  rooms: RoomInterface[];
}

const roomsModule: Module<RoomsStateInterface, StateInterface> = {
  namespaced: true,
  actions,
  mutations,
  state,
};

export default roomsModule;
