import type { ActionTree } from 'vuex';
import { api } from '@/plugins/axios';
import axios from 'axios';
import type { FolioApiInterface, FolioInterface } from '@/legacy/interfaces/FolioInterface';
import type { PayloadFolioInterface } from '@/legacy/interfaces/PayloadFolioInterface';
import type { TransactionInterface } from '@/legacy/interfaces/TransactionInterface';
import type {
  PayloadAccountMoveInterface,
  PayloadInvoiceInterface,
  PayloadMailFolioInterface,
  PayloadMailInvoiceInterface,
} from '@/legacy/interfaces/PayloadAccountMoveInterface';
import type { StateInterface } from '../index';
import type { FoliosStateInterface } from '.';
import type { ReservationInterface } from '@/legacy/interfaces/ReservationInterface';

const { CancelToken } = axios;
let cancel: (() => void) | undefined;
const actions: ActionTree<FoliosStateInterface, StateInterface> = {
  async fetchFolios(context, payload: PayloadFolioInterface) {
    let to = '';
    let from = '';
    let params = `?pmsPropertyId=${payload.propertyId}`;
    if (payload?.dateStart && payload.dateEnd) {
      from = `${payload.dateStart.getFullYear()}-${(payload.dateStart.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${payload.dateStart.getDate().toString().padStart(2, '0')}`;
      to = `${payload.dateEnd.getFullYear()}-${(payload.dateEnd.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${payload.dateEnd.getDate().toString().padStart(2, '0')}`;
      params += `&dateFrom=${from}&dateTo=${to}`;
    }
    if (payload.filter || payload.filterByState) {
      if (payload.filter) {
        params += `&filter=${payload.filter}`;
        if (cancel !== undefined) {
          cancel();
        }
      }
      if (payload.filterByState) {
        let filterByState = '';
        if (payload.filterByState === 1) {
          filterByState += 'byCheckin';
        } else if (payload.filterByState === 2) {
          filterByState += 'byCheckout';
        } else if (payload.filterByState === 3) {
          filterByState += 'onBoard';
        } else if (payload.filterByState === 4) {
          filterByState += 'toAssign';
        } else if (payload.filterByState === 5) {
          filterByState += 'cancelled';
        } else if (payload.filterByState === 6) {
          filterByState += 'checkinYesterday';
        } else if (payload.filterByState === 7) {
          filterByState += 'pendingCheckinToday';
        } else if (payload.filterByState === 8) {
          filterByState += 'completedCheckinsToday';
        } else if (payload.filterByState === 9) {
          filterByState += 'pendingCheckinsTomorrow';
        } else if (payload.filterByState === 10) {
          filterByState += 'pendingCheckoutsToday';
        } else if (payload.filterByState === 11) {
          filterByState += 'pendingCheckoutsTomorrow';
        } else if (payload.filterByState === 12) {
          filterByState += 'completedCheckoutsToday';
        } else if (payload.filterByState === 13) {
          filterByState += 'completedCheckoutsTomorrow';
        } else if (payload.filterByState === 14) {
          filterByState += 'overbooking';
        }
        params += `&filterByState=${filterByState}`;
      }
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
    if (payload.last) {
      params += '&last=true';
    }
    return api
      .get(`/folios${params}`, {
        cancelToken: new CancelToken((c) => {
          cancel = c;
        }),
      })
      .then((response) => {
        if (response) {
          context.commit('SET_FOLIOS', response.data);
        }
      });
  },

  async fetchFolio(context, folioId: number) {
    return api.get(`/folios/${folioId}`).then((response) => {
      context.commit('SET_CURRENT_FOLIO', response.data);
    });
  },

  setFoliosPlanning(context, folios: FolioInterface[]) {
    context.commit('SET_FOLIOS_PLANNING', folios);
  },
  setCurrentFolio(context, folio: FolioInterface) {
    context.commit('SET_CURRENT_FOLIO', folio);
  },
  async fetchFolioTransactions(context, folioId: number) {
    return api.get(`/folios/${folioId}/transactions`).then((response) => {
      context.commit('SET_FOLIO_TRANSACTIONS', response.data);
    });
  },
  async fetchFolioSaleLines(context, folioId: number) {
    return api.get(`/folios/${folioId}/sale-lines`).then((response) => {
      context.commit('SET_FOLIO_SALE_LINES', response.data);
    });
  },
  async fetchFolioInvoices(context, folioId: number) {
    return api.get(`/folios/${folioId}/invoices`).then((response) => {
      context.commit('SET_FOLIO_INVOICES', response.data);
    });
  },
  async createFolioCharge(context, payload: TransactionInterface) {
    return api.post(`/folios/${payload.folioId}/charge`, payload);
  },
  async createFolioRefund(context, payload: TransactionInterface) {
    return api.post(`/folios/${payload.folioId}/refund`, payload);
  },
  async createFolio(context, payload: FolioApiInterface) {
    payload.reservations.forEach((reservation) => {
      reservation.services?.forEach((service) => {
        service.serviceLines.forEach((serviceLine) => {
          const dateStr = `${(serviceLine.date as Date).getFullYear()}-${(
            (serviceLine.date as Date).getMonth() + 1
          )
            .toString()
            .padStart(2, '0')}-${(serviceLine.date as Date).getDate().toString().padStart(2, '0')}`;
          serviceLine.date = dateStr;
        });
      });
    });
    return api.post('/folios', payload);
  },
  async updateFolio(context, payload: { folioId: number; internalComment: string }) {
    return api.patch(`/folios/p/${payload.folioId}`, payload);
  },
  async updateLanguageFolio(context, payload: { folioId: number; language: string }) {
    return api.patch(`/folios/p/${payload.folioId}`, payload);
  },
  async updatePartnerFolio(
    context,
    payload: {
      folioId: number;
      partnerName: string;
      partnerEmail: string;
      partnerPhone: string;
      partnerId: number;
    }
  ) {
    return api.patch(`/folios/p/${payload.folioId}`, payload);
  },
  async addReservationsToFolio(context, payload: FolioApiInterface) {
    return api.patch(`folios/p/${payload.id ?? 0}`, payload);
  },
  async createFolioInvoice(context, payload: PayloadAccountMoveInterface) {
    return api.post(`/folios/${payload.folioId}/invoices`, payload);
  },
  async updateFolioInvoice(context, payload: PayloadInvoiceInterface) {
    return api.patch(`/invoices/p/${payload.invoiceId}`, payload);
  },
  async sendFolioMail(context, payload: PayloadMailFolioInterface) {
    return api.post(`/folios/${payload.folioId}/send-mail`, payload);
  },
  async sendMailInvoice(context, payload: PayloadMailInvoiceInterface) {
    return api.post(`/invoices/${payload.invoiceId}/send-mail`, payload);
  },
  async cancelFolioReservations(
    context,
    payload: { folioId: number; cancelReservations: boolean }
  ) {
    return api.patch(`/folios/p/${payload.folioId}`, payload);
  },
  async confirmFolioReservations(
    context,
    payload: { folioId: number; confirmReservations: boolean }
  ) {
    return api.patch(`/folios/p/${payload.folioId}`, payload);
  },

  fetchFolioMailData(context, payload: { folioId: number; mailType: string; language: string }) {
    let params = '';
    if (payload.mailType) {
      params += `?mailType=${payload.mailType}`;
    }
    if (payload.language) {
      params += `&language=${payload.language}`;
    }
    return api.get(`folios/${payload.folioId}/mail${params}`);
  },
  fetchInvoiceMailData(context, payload: { invoiceId: number; mailType: string }) {
    return api.get(`invoices/${payload.invoiceId}/mail`);
  },
  setLastFolioFilters(context, payload) {
    context.commit('SET_FOLIO_FILTERS', payload);
  },
  async fetchFolioMessages(context, folioId: number) {
    return api.get(`folios/${folioId}/messages`).then((response) => {
      context.commit('SET_FOLIO_MESSAGES', response.data);
    });
  },

  async fetchAdultsInFolio(context, folioId: number) {
    return api.get(`folios/${folioId}/adults`).then((response) => {
      context.commit('SET_ADULTS_IN_FOLIO', response.data);
    });
  },

  async fetchFolioPaymentLink(context, payload: { folioId: number; amount: number }) {
    let params = '';
    if (payload.amount) {
      params += `?amount=${payload.amount}`;
    }
    return api.get(`folios/${payload.folioId}/payment-link${params}`);
  },

  async updateFolioBatchChanges(
    context,
    payload: {
      folioId: number;
      reservations: ReservationInterface[];
    }
  ) {
    payload.reservations.forEach((res: ReservationInterface) => {
      res.reservationLines?.forEach((line) => {
        line.date = `${(line.date as Date).getFullYear()}-${((line.date as Date).getMonth() + 1)
          .toString()
          .padStart(2, '0')}-${(line.date as Date).getDate().toString().padStart(2, '0')}`;
      });

      res.checkin = `${(res.checkin as Date).getFullYear()}-${((res.checkin as Date).getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${(res.checkin as Date).getDate().toString().padStart(2, '0')}`;
      res.checkout = `${(res.checkout as Date).getFullYear()}-${(
        (res.checkout as Date).getMonth() + 1
      )
        .toString()
        .padStart(2, '0')}-${(res.checkout as Date).getDate().toString().padStart(2, '0')}`;
    });
    // console.log(payload);

    return api.patch(`/folios/p/${payload.folioId}`, payload);
  },
};

export default actions;
