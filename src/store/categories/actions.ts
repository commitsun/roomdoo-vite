import type { ActionTree } from 'vuex';
import { api } from '@/plugins/axios';
import type { CategoryInterface } from '@/interfaces/CategoryInterface';
import type { AxiosResponse } from 'axios';
import type { StateInterface } from '../index';
import type { CategoryStateInterface } from '.';

const actions: ActionTree<CategoryStateInterface, StateInterface> = {
  async fetchCategories(context) {
    return api.get('/categories').then((response: AxiosResponse<CategoryInterface[]>) => {
      context.commit('SET_CATEGORIES', response.data);
    });
  },
};

export default actions;
