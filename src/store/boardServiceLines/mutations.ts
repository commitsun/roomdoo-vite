import type { BoardServiceLineInterface } from 'src/interfaces/BoardServiceLineInterface';
import type { MutationTree } from 'vuex';
import type { BoardServiceLinesStateInterface } from '.';

const mutation: MutationTree<BoardServiceLinesStateInterface> = {
  SET_BOARD_SERVICE_LINES(
    state: BoardServiceLinesStateInterface,
    boardServiceLines: BoardServiceLineInterface[],
  ) {
    state.boardServiceLines = boardServiceLines;
  },
};

export default mutation;
