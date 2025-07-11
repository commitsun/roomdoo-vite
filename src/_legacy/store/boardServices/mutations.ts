import type { BoardServiceInterface } from '@/_legacy/interfaces/BoardServiceInterface';
import type { MutationTree } from 'vuex';
import type { BoardServicesStateInterface } from '.';

const mutation: MutationTree<BoardServicesStateInterface> = {
  SET_BOARD_SERVICES(state: BoardServicesStateInterface, boardServices: BoardServiceInterface[]) {
    state.boardServices = boardServices;
  },
};

export default mutation;
