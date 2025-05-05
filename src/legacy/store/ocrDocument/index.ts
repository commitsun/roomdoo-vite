import type { Module } from 'vuex';
import type { CheckinPartnerOcrInterface } from '@/legacy/interfaces/CheckinPartnerOcrInterface';
import type { StateInterface } from '../index';
import state from './state';
import actions from './actions';
import mutations from './mutations';

export interface OcrDocumentStateInterface {
  documentData: CheckinPartnerOcrInterface;
}

const ocrDocumentModule: Module<OcrDocumentStateInterface, StateInterface> = {
  namespaced: true,
  actions,
  mutations,
  state,
};

export default ocrDocumentModule;
