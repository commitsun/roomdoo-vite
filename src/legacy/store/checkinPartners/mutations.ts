import type { CheckinPartnerInterface } from '@/legacy/interfaces/CheckinPartnerInterface';

import type { MutationTree } from 'vuex';
import type { CheckinPartnerStateInterface } from '.';

const mutation: MutationTree<CheckinPartnerStateInterface> = {
  SET_CHECKIN_PARTNERS(
    state: CheckinPartnerStateInterface,
    checkinpartners: CheckinPartnerInterface[]
  ) {
    checkinpartners.forEach((checkinPartner) => {
      if (checkinPartner.birthdate) {
        checkinPartner.birthdate = new Date(checkinPartner.birthdate);
        if (!Number(checkinPartner.birthdate)) {
          checkinPartner.birthdate = null;
        }
      }
      if (checkinPartner.documentExpeditionDate) {
        checkinPartner.documentExpeditionDate = new Date(checkinPartner.documentExpeditionDate);
        if (!Number(checkinPartner.documentExpeditionDate)) {
          checkinPartner.documentExpeditionDate = null;
        }
      }
    });
    state.checkinpartners = checkinpartners;
  },

  SET_FOLIO_CHECKIN_PARTNERS(
    state: CheckinPartnerStateInterface,
    folioCheckinPartners: CheckinPartnerInterface[]
  ) {
    folioCheckinPartners.forEach((checkinPartner) => {
      if (checkinPartner.birthdate) {
        checkinPartner.birthdate = new Date(checkinPartner.birthdate);
        if (!Number(checkinPartner.birthdate)) {
          checkinPartner.birthdate = null;
        }
      }
      if (checkinPartner.documentExpeditionDate) {
        checkinPartner.documentExpeditionDate = new Date(checkinPartner.documentExpeditionDate);
        if (!Number(checkinPartner.documentExpeditionDate)) {
          checkinPartner.documentExpeditionDate = null;
        }
      }
    });
    state.folioCheckinPartners = folioCheckinPartners;
  },

  SET_CHECKIN_PARTNER_BY_DOC_NUMBER(
    state: CheckinPartnerStateInterface,
    checkinPartner: CheckinPartnerInterface
  ) {
    if (checkinPartner) {
      if (checkinPartner.birthdate) {
        checkinPartner.birthdate = new Date(checkinPartner.birthdate);
        if (!Number(checkinPartner.birthdate)) {
          checkinPartner.birthdate = null;
        }
      }
      if (checkinPartner.documentExpeditionDate) {
        checkinPartner.documentExpeditionDate = new Date(checkinPartner.documentExpeditionDate);
        if (!Number(checkinPartner.documentExpeditionDate)) {
          checkinPartner.documentExpeditionDate = null;
        }
      }
    }
    state.checkinPartner = checkinPartner;
  },

  CLEAR_CHECKIN_PARTNER(state: CheckinPartnerStateInterface) {
    state.checkinPartner = null;
  },
};

export default mutation;
