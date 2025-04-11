import type { UserInfoInterface } from 'src/interfaces/UserInfoInterface';
import type { MutationTree } from 'vuex';
import type { UserStateInterface } from '.';

const mutation: MutationTree<UserStateInterface> = {
  SET_CURRENT_USER(state: UserStateInterface, user: UserInfoInterface) {
    state.activeUser = user;
  },
  CLEAR_CURRENT_USER(state: UserStateInterface) {
    state.activeUser = null;
  },
};

export default mutation;
