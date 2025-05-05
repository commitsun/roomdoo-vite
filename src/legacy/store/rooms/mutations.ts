import type { RoomInterface } from '@/legacy/interfaces/RoomInterfaces';
import type { MutationTree } from 'vuex';
import type { RoomsStateInterface } from '.';

const mutation: MutationTree<RoomsStateInterface> = {
  SET_ROOMS(state: RoomsStateInterface, rooms: RoomInterface[]) {
    state.rooms = rooms;
  },
};

export default mutation;
