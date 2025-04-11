import type { RoomClosureReasonInterface } from '@/interfaces/RoomClosureReasonInterface';
import type { MutationTree } from 'vuex';
import type { RoomClosureReasonsStateInterface } from '.';

const mutation: MutationTree<RoomClosureReasonsStateInterface> = {
  SET_ROOM_CLOSURE_REASONS(
    state: RoomClosureReasonsStateInterface,
    roomClosureReasons: RoomClosureReasonInterface[]
  ) {
    state.roomClosureReasons = roomClosureReasons;
  },
};

export default mutation;
