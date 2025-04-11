import type { ReservationLineInterface } from '@/interfaces/ReservationLineInterface';
import type { MutationTree } from 'vuex';
import type { ReservationLinesStateInterface } from '.';

const mutation: MutationTree<ReservationLinesStateInterface> = {
  SET_RESERVATION_LINES(
    state: ReservationLinesStateInterface,
    reservationLines: ReservationLineInterface[]
  ) {
    reservationLines.forEach((line) => {
      line.date = new Date(line.date);
    });
    state.reservationLines = reservationLines;
  },
  CLEAR_RESERVATION_LINES(state: ReservationLinesStateInterface) {
    state.reservationLines = [];
  },
  ADD_RESERVATION_LINES(
    state: ReservationLinesStateInterface,
    reservationLines: ReservationLineInterface[]
  ) {
    reservationLines.forEach((line) => {
      line.date = new Date(line.date);
      state.reservationLines.push(line);
    });
  },
};

export default mutation;
