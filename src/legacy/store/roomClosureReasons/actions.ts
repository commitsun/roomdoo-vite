import type { ActionTree } from 'vuex';

import { api } from '@/legacy/http/axios';
import type { StateInterface } from '../index';
import type { RoomClosureReasonsStateInterface } from '.';

const actions: ActionTree<RoomClosureReasonsStateInterface, StateInterface> = {
  async fetchRoomClosureReasons(context) {
    return api.get('/room-closure-reasons').then((response) => {
      context.commit('SET_ROOM_CLOSURE_REASONS', response.data);
    });
  },
};

export default actions;
