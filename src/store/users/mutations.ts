import type { UsersInterface } from '@/interfaces/UsersInterface';
import type { MutationTree } from 'vuex';
import type { UsersStateInterface } from '.';

const mutation: MutationTree<UsersStateInterface> = {
  SET_USERS(state: UsersStateInterface, users: UsersInterface[]) {
    state.users = users;
  },
};

export default mutation;
