import axios, { type AxiosResponse } from 'axios';
import { api } from '@/plugins/axios';
import type { InvoiceResultInterface } from 'src/interfaces/InvoiceResultInterface';
import type { PayloadInvoiceRequestInterface } from 'src/interfaces/PayloadInvoiceRequestInterface';
import type { ActionTree } from 'vuex';
import type { InvoicesStateInterface } from '.';
import type { StateInterface } from '..';

const { CancelToken } = axios;
let cancel: (() => void) | undefined;

const actions: ActionTree<InvoicesStateInterface, StateInterface> = {
  async fetchInvoices(context, payload: PayloadInvoiceRequestInterface) {
    let params = '';
    let to = '';
    let from = '';
    if (payload.pmsPropertyId) {
      params += `?pmsPropertyId=${payload.pmsPropertyId}`;
    }
    if (payload.limit) {
      params += `&limit=${payload.limit}`;
    }
    if (payload.offset) {
      params += `&offset=${payload.offset}`;
    }
    if (payload.orderBy) {
      params += `&orderBy=${payload.orderBy}`;
    }
    if (payload.orderDesc) {
      params += `&orderDesc=${payload.orderDesc.toString()}`;
    }
    if (payload.filter) {
      params += `&filter=${payload.filter}`;
    }
    if (payload.paymentState) {
      params += `&paymentState=${payload.paymentState}`;
    }
    if (payload.dateStart && payload.dateEnd) {
      from = `${payload.dateStart.getFullYear()}-${(payload.dateStart.getMonth() + 1).toString().padStart(2, '0')}-${payload.dateStart.getDate().toString().padStart(2, '0')}`;
      to = `${payload.dateEnd.getFullYear()}-${(payload.dateEnd.getMonth() + 1).toString().padStart(2, '0')}-${payload.dateEnd.getDate().toString().padStart(2, '0')}`;
      params += `&dateStart=${from}&dateEnd=${to}`;
    }
    if (payload.originAgencyId) {
      params += `&originAgencyId=${payload.originAgencyId}`;
    }
    if (cancel !== undefined) {
      cancel();
    }
    return api
      .get(`/invoices${params}`, {
        cancelToken: new CancelToken((c) => {
          cancel = c;
        }),
      })
      .then((response: AxiosResponse<InvoiceResultInterface>) => {
        if (response) {
          if (this.state.invoices.invoices.length > 0) {
            context.commit('PUSH_INVOICES', response.data.invoices);
            context.commit('ADD_TOTAL_AMOUNT', response.data.total);
          } else {
            context.commit('SET_INVOICES', response.data.invoices);
            context.commit('SET_TOTAL_AMOUNT', response.data.total);
          }
          context.commit('SET_TOTAL_INVOICES', response.data.totalInvoices);
        }
      });
  },

  async deleteInvoice(context, payload: number) {
    return api.delete(`/invoices/${payload}`);
  },

  clearInvoices(context) {
    context.commit('CLEAR_INVOICES');
  },

  async sendMailOrPrintInvoices(
    context,
    payload: {
      invoiceIds: number[];
      partnerIds: number[];
      emailAddresses: string[];
      isEmail: boolean;
      isPrint: boolean;
    },
  ) {
    return api.post('/invoices/send-mail-print-invoices', payload);
  },
};

export default actions;
