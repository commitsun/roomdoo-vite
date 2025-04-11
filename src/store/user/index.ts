import type { Module } from 'vuex';
import type { UserInfoInterface } from '@/interfaces/UserInfoInterface';
import type { StateInterface } from '../index';
import state from './state';
import actions from './actions';
import mutations from './mutations';

export interface UserStateInterface {
  activeUser: UserInfoInterface | null;
}

const userModule: Module<UserStateInterface, StateInterface> = {
  namespaced: true,
  actions,
  mutations,
  state,
};

export default userModule;
