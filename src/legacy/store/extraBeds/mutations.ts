import type { ExtraBedInterface } from '@/legacy/interfaces/ExtraBedInterface';
import type { MutationTree } from 'vuex';
import type { ExtraBedsStateInterface } from '.';

const mutation: MutationTree<ExtraBedsStateInterface> = {
  SET_EXTRA_BEDS(state: ExtraBedsStateInterface, extraBeds: ExtraBedInterface[]) {
    state.extraBeds = extraBeds;
  },
};

export default mutation;
