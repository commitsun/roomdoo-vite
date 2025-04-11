import type { Module } from 'vuex';
import type { RoomTypeInterface } from 'src/interfaces/RoomTypeInterfaces';
import type { StateInterface } from '../index';
import state from './state';
import actions from './actions';
import mutations from './mutations';

export interface RoomTypeStateInterface {
  roomTypes: RoomTypeInterface[];
  restrictedRoomType: RoomTypeInterface | null;
}

const roomTypesModule: Module<RoomTypeStateInterface, StateInterface> = {
  namespaced: true,
  actions,
  mutations,
  state,
};

export default roomTypesModule;
