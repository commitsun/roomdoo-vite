import type { ActionTree } from 'vuex';
import { api } from '@/legacy/http/axios';
import type { DocumentTypeInterface } from '@/legacy/interfaces/DocumentTypeInterface';
import type { AxiosResponse } from 'axios';
import type { StateInterface } from '../index';
import type { DocumentTypeStateInterface } from '.';

const actions: ActionTree<DocumentTypeStateInterface, StateInterface> = {
  async fetchDocumentTypes(context) {
    return api.get('/id-categories').then((response: AxiosResponse<DocumentTypeInterface[]>) => {
      context.commit('SET_DOCUMENT_TYPES', response.data);
    });
  },
};

export default actions;
