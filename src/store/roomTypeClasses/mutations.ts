import type { RoomTypeClassInterface } from '@/interfaces/RoomTypeClassInterface';
import type { MutationTree } from 'vuex';
import type { RoomTypeClassStateInterface } from '.';

const mutation: MutationTree<RoomTypeClassStateInterface> = {
  SET_ROOM_TYPE_CLASS(state: RoomTypeClassStateInterface, roomTypeClass: RoomTypeClassInterface[]) {
    state.roomTypeClasses = roomTypeClass;
  },
};

export default mutation;
