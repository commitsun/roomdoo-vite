import type { ActionTree } from 'vuex';
import { api } from '@/_legacy/http/axios';
import type { CheckinPartnerInterface } from '@/_legacy/interfaces/CheckinPartnerInterface';
import type { PayLoadCheckinPartnerInterface } from '@/_legacy/interfaces/PayLoadCheckinPartnerInterface';
import type { AxiosResponse } from 'axios';
import type { StateInterface } from '../index';
import type { CheckinPartnerStateInterface } from '.';

const actions: ActionTree<CheckinPartnerStateInterface, StateInterface> = {
  async fetchCheckinPartners(context, payload: number) {
    return api.get(`/reservations/${payload}/checkin-partners`).then((response) => {
      context.commit('SET_CHECKIN_PARTNERS', response.data);
    });
  },

  async fetchFolioCheckinPartners(context, payload: number) {
    return api.get(`/folios/${payload}/checkin-partners`).then((response) => {
      context.commit('SET_FOLIO_CHECKIN_PARTNERS', response.data);
    });
  },

  async fetchCheckinPartnerByDocNumber(context, payload: PayLoadCheckinPartnerInterface) {
    return api
      .get(`/partners/${payload.documentType}/${payload.documentNumber}`)
      .then((response: AxiosResponse<CheckinPartnerInterface[]>) => {
        context.commit('SET_CHECKIN_PARTNER_BY_DOC_NUMBER', response.data[0]);
      });
  },
  clearCheckinPartner(context) {
    context.commit('CLEAR_CHECKIN_PARTNER');
  },

  async updateCheckinPartner(context, payload: CheckinPartnerInterface) {
    let birthdate = '';
    if (payload.birthdate) {
      birthdate = `${payload.birthdate.getDate().toString().padStart(2, '0')}/${(
        payload.birthdate.getMonth() + 1
      )
        .toString()
        .padStart(2, '0')}/${payload.birthdate.getFullYear()}`;
    }

    const send = {
      ...payload,
      birthdate,
      nationality: payload.nationality !== 0 ? payload.nationality : null,
      documentType: payload.documentType !== 0 ? payload.documentType : null,
      countryId: payload.countryId !== 0 ? payload.countryId : null,
      countryState: payload.countryState !== 0 ? payload.countryState : null,
      documentCountryId: payload.documentCountryId !== 0 ? payload.documentCountryId : null,
    };
    const reservationId = payload.reservationId ?? 0;
    if (payload.id < 0) {
      return api.post(`/reservations/${reservationId}/checkin-partners`, send);
    }
    return api.patch(`/reservations/p/${reservationId}/checkin-partners/${payload.id}`, send);
  },

  async onBoardCheckinPartner(
    context,
    payload: { reservationId: number; checkinPartnerId: number },
  ) {
    return api.patch(
      `/reservations/p/${payload.reservationId}/checkin-partners/${payload.checkinPartnerId}?actionOnBoard=true`,
    );
  },

  async deleteCheckinPartner(
    context,
    payload: { reservationId: number; checkinPartnerId: number },
  ) {
    return api.delete(
      `/reservations/${payload.reservationId}/checkin-partners/${payload.checkinPartnerId}`,
    );
  },

  async fetchPdfCheckin(context, payload: { reservationId: number; checkinPartnerId: number }) {
    return api.get(
      `/reservations/${payload.reservationId}/checkin-partners/${payload.checkinPartnerId}/checkin-report`,
    );
  },
  async fetchPdfAllCheckins(context, reservationId: number) {
    return api.get(`/reservations/${reservationId}/checkin-report`);
  },
};

export default actions;
