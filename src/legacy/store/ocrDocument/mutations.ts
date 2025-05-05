import type { MutationTree } from 'vuex';
import type { CheckinPartnerOcrInterface } from '@/legacy/interfaces/CheckinPartnerOcrInterface';
import type { OcrDocumentStateInterface } from '.';

const mutation: MutationTree<OcrDocumentStateInterface> = {
  SET_DOCUMENT_DATA(
    state: OcrDocumentStateInterface,
    checkinPartnerOcr: CheckinPartnerOcrInterface
  ) {
    if (checkinPartnerOcr.birthdate) {
      checkinPartnerOcr.birthdate = new Date(checkinPartnerOcr.birthdate);
    }
    if (checkinPartnerOcr.documentExpeditionDate) {
      checkinPartnerOcr.documentExpeditionDate = new Date(checkinPartnerOcr.documentExpeditionDate);
    }
    state.documentData = checkinPartnerOcr;
  },

  RESET_DOCUMENT_DATA(state: OcrDocumentStateInterface) {
    state.documentData = {
      nationality: 0,
      countryId: 0,
      firstname: '',
      lastname: '',
      lastname2: '',
      gender: '',
      birthdate: null,
      documentType: 0,
      documentExpeditionDate: null,
      documentSupportNumber: '',
      documentNumber: '',
      residenceStreet: '',
      residenceCity: '',
      countryState: 0,
    };
  },
};

export default mutation;
