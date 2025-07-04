import type { ActionTree } from 'vuex';
import { api } from '@/legacy/http/axios';
import type { PartnerInterface } from '@/legacy/interfaces/PartnerInterface';
import axios, { type AxiosResponse } from 'axios';
import type { TransactionInterface } from '@/legacy/interfaces/TransactionInterface';
import type { InvoiceInterface } from '@/legacy/interfaces/InvoiceInterface';
import type { PayloadPartnerRequestInterface } from '@/legacy/interfaces/PayloadPartnerRequestInterface';
import type { PartnerResultInterface } from '@/legacy/interfaces/PartnerResultInterface';
import type { StateInterface } from '../index';
import type { PartnerStateInterface } from '.';

const { CancelToken } = axios;
let cancel: (() => void) | undefined;

const actions: ActionTree<PartnerStateInterface, StateInterface> = {
  async fetchCurrentPartner(context, payload: number) {
    return api.get(`/partners/${payload}`).then((response: AxiosResponse<PartnerInterface>) => {
      context.commit('SET_CURRENT_PARTNER', response.data);
    });
  },

  async createPartner(context, payload: PartnerInterface) {
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
    };
    return api.post('/partners', send);
  },

  async deletePartner(context, payload: number) {
    return api.patch(`/partners/p/${payload}/deactivate`);
  },

  async activatePartner(context, payload: number) {
    return api.patch(`/partners/p/${payload}/activate`);
  },

  async updatePartner(context, payload: PartnerInterface) {
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
    };
    return api.patch(`/partners/p/${payload.id}`, send);
  },

  async removePartner(context) {
    await new Promise((resolve) => {
      context.commit('REMOVE_PARTNER');
      resolve(null);
    });
  },

  removePartners(context) {
    context.commit('REMOVE_PARTNERS');
  },
  async fetchPartners(context, payload: PayloadPartnerRequestInterface) {
    let params = '';
    if (payload.limit) params += `?limit=${payload.limit}`;
    if (payload.offset) params += `&offset=${payload.offset}`;
    if (payload.housedNow) params += `&housedNow=${payload.housedNow.toString()}`;
    if (payload.housedLastWeek) params += `&housedLastWeek=${payload.housedLastWeek.toString()}`;
    if (payload.housedLastMonth) params += `&housedLastMonth=${payload.housedLastMonth.toString()}`;

    if (payload.isAgency || payload.isCompany || payload.isIndividual) {
      const filterByType = payload.isAgency
        ? 'agency'
        : payload.isCompany
        ? 'company'
        : 'individual';
      params += `&filterByType=${filterByType}`;
    }

    if (payload.multiFieldSearch) {
      params += `&filter=${payload.multiFieldSearch}`;
    }

    if (cancel !== undefined) {
      cancel();
      cancel = undefined;
    }

    try {
      const response: AxiosResponse<PartnerResultInterface> = await api.get(`/partners${params}`, {
        cancelToken: new CancelToken((c) => {
          cancel = c;
        }),
      });

      if (response && response.data) {
        if (context.state.partners.length === 0) {
          context.commit('SET_PARTNERS', response.data.partners);
        } else {
          context.commit('PUSH_PARTNERS', response.data.partners);
        }
        context.commit('SET_TOTAL_PARTNERS', response.data.total);
      }
    } catch (error) {
      if (!axios.isCancel(error)) {
        throw error;
      }
    }
  },

  setCurrentPartner(context, partner: PartnerInterface) {
    context.commit('SET_CURRENT_PARTNER', partner);
  },
  clearCurrentPartner(context) {
    context.commit('CLEAR_CURRENT_PARTNER');
  },
  async fetchCurrentPartnerTransactions(context, partnerId: number) {
    return api
      .get(`/partners/${partnerId}/payments`)
      .then((response: AxiosResponse<TransactionInterface[]>) => {
        context.commit('SET_CURRENT_PARTNER_TRANSACTIONS', response.data);
      });
  },
  async fetchCurrentPartnerInvoices(context, partnerId: number) {
    return api
      .get(`/partners/${partnerId}/invoices`)
      .then((response: AxiosResponse<InvoiceInterface[]>) => {
        context.commit('SET_CURRENT_PARTNER_INVOICES', response.data);
      });
  },
  async checkDocumentNumber(
    context,
    payload: { documentType: number; documentNumber: string; documentCountryId: number }
  ) {
    return api.get(
      `/partners/check-doc-number/${payload.documentNumber}/${payload.documentType}/${payload.documentCountryId}`
    );
  },

  async fetchPartnerByVat(context, payload: string) {
    return api.get(`/partners/vat_number/${payload}`);
  },
};

export default actions;
