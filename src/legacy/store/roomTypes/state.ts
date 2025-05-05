import type { RoomTypeStateInterface } from '.';

function state(): RoomTypeStateInterface {
  return {
    roomTypes: [],
    restrictedRoomType: null,
  };
}

export default state;
