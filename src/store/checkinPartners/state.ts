import type { CheckinPartnerStateInterface } from '.';

function state(): CheckinPartnerStateInterface {
  return {
    checkinpartners: [],
    checkinPartner: null,
    folioCheckinPartners: [],
  };
}

export default state;
