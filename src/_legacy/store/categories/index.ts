import type { Module } from 'vuex';
import type { CategoryInterface } from '@/_legacy/interfaces/CategoryInterface';
import type { StateInterface } from '../index';
import state from './state';
import actions from './actions';
import mutations from './mutations';

export interface CategoryStateInterface {
  categories: CategoryInterface[];
}

const categoriesModule: Module<CategoryStateInterface, StateInterface> = {
  namespaced: true,
  actions,
  mutations,
  state,
};

export default categoriesModule;
