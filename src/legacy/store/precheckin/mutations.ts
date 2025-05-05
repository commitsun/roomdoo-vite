import type { MutationTree } from 'vuex';
import type { FolioPrecheckinInterface } from '@/legacy/interfaces/FolioPrecheckinInterface';
import type { CheckinPartnerInterface } from '@/legacy/interfaces/CheckinPartnerInterface';
import type { PrecheckinStateInterface } from '.';

const mutation: MutationTree<PrecheckinStateInterface> = {
  SET_FOLIO_PUBLIC_INFO(state: PrecheckinStateInterface, folio: FolioPrecheckinInterface) {
    folio.reservations.forEach((reservation) => {
      reservation.checkin = new Date(reservation.checkin);
      reservation.checkout = new Date(reservation.checkout);
    });

    state.folioPublicInfo = folio;
  },
  SET_EXISTING_CHECKIN_PARTNER(
    state: PrecheckinStateInterface,
    checkinPartner: CheckinPartnerInterface
  ) {
    state.existingCheckinPartner = checkinPartner;

    if (checkinPartner?.documentExpeditionDate) {
      state.existingCheckinPartner.documentExpeditionDate = new Date(
        checkinPartner.documentExpeditionDate
      );
    }
    if (checkinPartner?.birthdate) {
      state.existingCheckinPartner.birthdate = new Date(checkinPartner.birthdate);
    }

    // state.existingCheckinPartner.documentExpeditionDate = checkinPartner?.documentExpeditionDate
    //   ? new Date(checkinPartner.documentExpeditionDate)
    //   : null;
  },
  SET_ANY_ADULTS_IN_FOLIO(state: PrecheckinStateInterface, someAdults: boolean) {
    state.areThereAnyAdultsInFolio = someAdults;
  },
};

export default mutation;
