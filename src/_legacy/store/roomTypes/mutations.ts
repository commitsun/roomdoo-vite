import type { RoomTypeInterface } from '@/_legacy/interfaces/RoomTypeInterfaces';
import type { MutationTree } from 'vuex';
import type { RoomTypeStateInterface } from '.';

const mutation: MutationTree<RoomTypeStateInterface> = {
  SET_ROOM_TYPES(state: RoomTypeStateInterface, roomTypes: RoomTypeInterface[]) {
    roomTypes.forEach((el) => {
      el.visible = true;
    });
    state.roomTypes = roomTypes;
  },

  SET_ROOM_TYPE_VISIBILITY(state: RoomTypeStateInterface, payload: number) {
    const roomTypeToChangeVisibility = state.roomTypes.find((el) => el.id === payload);
    if (roomTypeToChangeVisibility) {
      roomTypeToChangeVisibility.visible = !roomTypeToChangeVisibility.visible;
    }
  },
  SET_RESTRICTED_ROOM_TYPE(state: RoomTypeStateInterface, roomType: RoomTypeInterface) {
    state.restrictedRoomType = roomType;
  },
};

export default mutation;
