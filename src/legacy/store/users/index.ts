import type { Module } from 'vuex';
import type { UsersInterface } from '@/legacy/interfaces/UsersInterface';
import type { StateInterface } from '../index';
import state from './state';
import actions from './actions';
import mutations from './mutations';

export interface UsersStateInterface {
  users: UsersInterface[];
}

const usersModule: Module<UsersStateInterface, StateInterface> = {
  namespaced: true,
  actions,
  mutations,
  state,
};

export default usersModule;
