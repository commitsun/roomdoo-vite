import type { Module } from 'vuex';
import type { DocumentTypeInterface } from 'src/interfaces/DocumentTypeInterface';
import type { StateInterface } from '../index';
import state from './state';
import actions from './actions';
import mutations from './mutations';

export interface DocumentTypeStateInterface {
  documentType: DocumentTypeInterface[];
}

const documentTypeModule: Module<DocumentTypeStateInterface, StateInterface> = {
  namespaced: true,
  actions,
  mutations,
  state,
};

export default documentTypeModule;
