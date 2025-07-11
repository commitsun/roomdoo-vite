import type { MutationTree } from 'vuex';
import type { CheckinPartnerOcrInterface } from '@/_legacy/interfaces/CheckinPartnerOcrInterface';
import type { OcrDocumentStateInterface } from '.';

const mutation: MutationTree<OcrDocumentStateInterface> = {
  SET_DOCUMENT_DATA(
    state: OcrDocumentStateInterface,
    checkinPartnerOcr: CheckinPartnerOcrInterface
  ) {
    if (checkinPartnerOcr.birthdate) {
      checkinPartnerOcr.birthdate = new Date(checkinPartnerOcr.birthdate);
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
      documentSupportNumber: '',
      documentNumber: '',
      residenceStreet: '',
      residenceCity: '',
      countryState: 0,
    };
  },
};

export default mutation;
