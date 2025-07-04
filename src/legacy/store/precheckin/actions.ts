import type { ActionTree } from 'vuex';
import { api } from '@/legacy/http/axios';

import type { PayloadFolioPrecheckinInterface } from '@/legacy/interfaces/PayloadFolioPrecheckinInterface';
import type { AxiosResponse } from 'axios';
import type { CheckinPartnerInterface } from '@/legacy/interfaces/CheckinPartnerInterface';
import type { PrecheckinStateInterface } from '.';
import type { StateInterface } from '../index';

const actions: ActionTree<PrecheckinStateInterface, StateInterface> = {
  async fetchFolioPublicInfo(context, payload: PayloadFolioPrecheckinInterface) {
    return api.get(`/folios/${payload.id}/precheckin/${payload.token}`).then((response) => {
      if (response) {
        context.commit('SET_FOLIO_PUBLIC_INFO', response.data);
      }
    });
  },
  async fetchReservationPublicInfo(context, payload: PayloadFolioPrecheckinInterface) {
    return api.get(`/reservations/${payload.id}/precheckin/${payload.token}`).then((response) => {
      if (response) {
        context.commit('SET_FOLIO_PUBLIC_INFO', response.data);
      }
    });
  },
  async fetchPartnerByDocNumber(
    context,
    payload: {
      documentType: string;
      documentNumber: string;
      token: string;
      reservationId: number;
    }
  ) {
    return api
      .get(
        `/reservations/${payload.reservationId}/precheckin-reservation/${payload.token}/partner/${payload.documentType}/${payload.documentNumber}`
      )
      .then((response: AxiosResponse<CheckinPartnerInterface[]>) => {
        context.commit('SET_EXISTING_CHECKIN_PARTNER', response.data[0]);
      });
  },
  async checkSomeAdultsInFolio(
    context,
    payload: {
      reservationId: number;
      token: string;
      documentNumber?: string;
    }
  ) {
    let params = '';
    if (payload.documentNumber) {
      params = `?documentNumber=${payload.documentNumber}`;
    }
    return api
      .get(
        `/reservations/${payload.reservationId}/precheckin/${payload.token}/folio-adults${params}`
      )
      .then((response: AxiosResponse<boolean>) => {
        context.commit('SET_ANY_ADULTS_IN_FOLIO', response.data);
      });
  },

  async savePrecheckin(
    context,
    payload: {
      checkinPartner: CheckinPartnerInterface;
      token: string;
      reservationId: number;
    }
  ) {
    const checkinPartner = {
      id: payload.checkinPartner.id,
      originInputData: payload.checkinPartner.originInputData,
      signature: payload.checkinPartner.signature,
      signOn: payload.checkinPartner.signOn,
      documentCountryId: payload.checkinPartner.documentCountryId,
      documentType: payload.checkinPartner.documentType,
      documentNumber: payload.checkinPartner.documentNumber,
    };
    if (payload.checkinPartner.partnerId) {
      Object.assign(checkinPartner, { partnerId: payload.checkinPartner.partnerId });
    }
    if (
      payload.checkinPartner.documentSupportNumber &&
      payload.checkinPartner.documentSupportNumber !== '' &&
      payload.checkinPartner.documentSupportNumber !== '#'
    ) {
      Object.assign(checkinPartner, {
        documentSupportNumber: payload.checkinPartner.documentSupportNumber,
      });
    }
    if (
      payload.checkinPartner.firstname &&
      payload.checkinPartner.firstname !== '' &&
      payload.checkinPartner.firstname !== '#'
    ) {
      Object.assign(checkinPartner, { firstname: payload.checkinPartner.firstname });
    }
    if (
      payload.checkinPartner.lastname &&
      payload.checkinPartner.lastname !== '' &&
      payload.checkinPartner.lastname !== '#'
    ) {
      Object.assign(checkinPartner, { lastname: payload.checkinPartner.lastname });
    }
    if (
      payload.checkinPartner.lastname2 &&
      payload.checkinPartner.lastname2 !== '' &&
      payload.checkinPartner.lastname2 !== '#'
    ) {
      Object.assign(checkinPartner, { lastname2: payload.checkinPartner.lastname2 });
    }

    if (
      payload.checkinPartner.gender &&
      payload.checkinPartner.gender !== '' &&
      payload.checkinPartner.gender !== '#'
    ) {
      Object.assign(checkinPartner, { gender: payload.checkinPartner.gender });
    }

    if (payload.checkinPartner.birthdate && payload.checkinPartner.birthdate.getTime() !== 0) {
      Object.assign(checkinPartner, { birthdate: payload.checkinPartner.birthdate });
    }

    if (
      payload.checkinPartner.nationality &&
      payload.checkinPartner.nationality !== -1 &&
      payload.checkinPartner.nationality !== 0
    ) {
      Object.assign(checkinPartner, { nationality: payload.checkinPartner.nationality });
    }

    if (
      payload.checkinPartner.residenceStreet &&
      payload.checkinPartner.residenceStreet !== '' &&
      payload.checkinPartner.residenceStreet !== '#'
    ) {
      Object.assign(checkinPartner, { residenceStreet: payload.checkinPartner.residenceStreet });
    }

    if (
      payload.checkinPartner.zip &&
      payload.checkinPartner.zip !== '' &&
      payload.checkinPartner.zip !== '#'
    ) {
      Object.assign(checkinPartner, { zip: payload.checkinPartner.zip });
    }

    if (
      payload.checkinPartner.residenceCity &&
      payload.checkinPartner.residenceCity !== '' &&
      payload.checkinPartner.residenceCity !== '#'
    ) {
      Object.assign(checkinPartner, { residenceCity: payload.checkinPartner.residenceCity });
    }

    if (
      payload.checkinPartner.countryId &&
      payload.checkinPartner.countryId !== -1 &&
      payload.checkinPartner.countryId !== 0
    ) {
      Object.assign(checkinPartner, { countryId: payload.checkinPartner.countryId });
    }

    if (
      payload.checkinPartner.countryState &&
      payload.checkinPartner.countryState !== -1 &&
      payload.checkinPartner.countryState !== 0
    ) {
      Object.assign(checkinPartner, { countryState: payload.checkinPartner.countryState });
    }

    if (payload.checkinPartner.relationship && payload.checkinPartner.documentLegalRepresentative) {
      Object.assign(checkinPartner, {
        relationship: payload.checkinPartner.relationship,
        documentLegalRepresentative: payload.checkinPartner.documentLegalRepresentative,
      });
    }

    if (
      payload.checkinPartner.email &&
      payload.checkinPartner.email !== '' &&
      payload.checkinPartner.email !== '#'
    ) {
      Object.assign(checkinPartner, { email: payload.checkinPartner.email });
    }

    if (
      payload.checkinPartner.mobile &&
      payload.checkinPartner.mobile !== '' &&
      payload.checkinPartner.mobile !== '#'
    ) {
      Object.assign(checkinPartner, { mobile: payload.checkinPartner.mobile });
    }

    return api
      .patch(
        `/reservations/${payload.reservationId}/precheckin-reservation/${
          payload.token
        }/checkin-partners/${payload.checkinPartner.id ?? ''}`,
        checkinPartner
      )
      .then((response: AxiosResponse<CheckinPartnerInterface>) => {
        context.commit('SET_EXISTING_CHECKIN_PARTNER', response.data);
      });
  },

  clearExistingCheckinPartner(context) {
    context.commit('SET_EXISTING_CHECKIN_PARTNER', null);
  },
};

export default actions;
