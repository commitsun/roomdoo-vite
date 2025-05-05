import type { ActionTree } from 'vuex';
import { api } from '@/plugins/axios';
import type { StateInterface } from '../index';
import type { RoomTypeStateInterface } from '.';

const actions: ActionTree<RoomTypeStateInterface, StateInterface> = {
  async fetchRoomTypes(context, propertyId: number) {
    return api.get(`/room-types?pmsPropertyIds[]=${propertyId.toString()}`).then((response) => {
      context.commit('SET_ROOM_TYPES', response.data);
    });
  },

  changeRoomTypeVisibility(context, payload: number) {
    context.commit('SET_ROOM_TYPE_VISIBILITY', payload);
  },

  async fetchRestrictedRoomType(context, roomTypeId: number) {
    return api.get(`/room-types/restricted/${roomTypeId}`).then((response) => {
      context.commit('SET_RESTRICTED_ROOM_TYPE', response.data);
    });
  },
};

export default actions;
