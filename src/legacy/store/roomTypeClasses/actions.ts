import type { ActionTree } from 'vuex';
import { api } from '@/plugins/axios';
import type { StateInterface } from '../index';
import type { RoomTypeClassStateInterface } from '.';

const actions: ActionTree<RoomTypeClassStateInterface, StateInterface> = {
  async fetchRoomTypeClasses(context, propertyId: number) {
    return api
      .get(`/room-type-classes?pmsPropertyIds[]=${propertyId.toString()}`)
      .then((response) => {
        context.commit('SET_ROOM_TYPE_CLASS', response.data);
      });
  },
};

export default actions;
