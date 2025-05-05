import type { ActionTree } from 'vuex';
import { api } from '@/plugins/axios';
import type { AxiosResponse } from 'axios';
import type { CheckinPartnerOcrInterface } from '@/legacy/interfaces/CheckinPartnerOcrInterface';
import type { StateInterface } from '../index';
import type { OcrDocumentStateInterface } from '.';

interface PayloadProcessOCR {
  imageBase64Front: string;
  imageBase64Back?: string;
  pmsPropertyId: number;
  token?: string;
  reservationId?: string;
}
const actions: ActionTree<OcrDocumentStateInterface, StateInterface> = {
  async processDocument(context, payload: PayloadProcessOCR) {
    return api
      .post('/ocr-document', payload)
      .then((response: AxiosResponse<CheckinPartnerOcrInterface>) => {
        context.commit('SET_DOCUMENT_DATA', response.data);
      });
  },

  async publicProcessDocument(context, payload: PayloadProcessOCR) {
    if (payload.token && payload.reservationId) {
      return api
        .post(
          `/ocr-document/${payload.reservationId}/precheckin-reservation/${payload.token}`,
          payload
        )
        .then((response: AxiosResponse<CheckinPartnerOcrInterface>) => {
          context.commit('SET_DOCUMENT_DATA', response.data);
        });
    }
    throw new Error('Token or reservationId is missing');
  },

  resetDocumentData(context) {
    context.commit('RESET_DOCUMENT_DATA');
  },
};
export default actions;
