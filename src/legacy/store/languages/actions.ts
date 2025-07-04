import type { ActionTree } from 'vuex';
import { api } from '@/legacy/http/axios';
import type { LanguageInterface } from '@/legacy/interfaces/LanguageInterface';
import type { AxiosResponse } from 'axios';
import type { StateInterface } from '../index';
import type { LanguageStateInterface } from '.';

const actions: ActionTree<LanguageStateInterface, StateInterface> = {
  async fetchLanguages(context) {
    return api.get('/languages').then((response: AxiosResponse<LanguageInterface[]>) => {
      context.commit('SET_LANGUAGES', response.data);
    });
  },
};

export default actions;
