import type { ActionTree } from 'vuex';
import { api } from '@/plugins/axios';
import type { AxiosResponse } from 'axios';
import type { TransactionResultInterface } from '@/legacy/interfaces/TransactionResultInterface';
import type { PayloadTransactionRequestInterface } from '@/legacy/interfaces/PayloadTransactionRequestInterface';
import type { PayloadTransactionReport } from '@/legacy/interfaces/PayloadTransactionReport';
import type { TransactionInterface } from '@/legacy/interfaces/TransactionInterface';
import type { StateInterface } from '../index';
import type { TransactionsStateInterface } from '.';

const actions: ActionTree<TransactionsStateInterface, StateInterface> = {
  async fetchTransactions(context, payload: PayloadTransactionRequestInterface) {
    let params = '';
    let to = '';
    let from = '';
    if (payload.pmsPropertyId) {
      params += `?pmsPropertyId=${payload.pmsPropertyId}`;
    }
    if (payload.dateStart && payload.dateEnd) {
      from = `${payload.dateStart.getFullYear()}-${(payload.dateStart.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${payload.dateStart.getDate().toString().padStart(2, '0')}`;
      to = `${payload.dateEnd.getFullYear()}-${(payload.dateEnd.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${payload.dateEnd.getDate().toString().padStart(2, '0')}`;
      params += `&dateStart=${from}&dateEnd=${to}`;
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
    if (payload.transactionMethodId) {
      params += `&transactionMethodId=${payload.transactionMethodId}`;
    }
    if (payload.transactionType && payload.transactionType.length >= 1) {
      const mappedTransactionType: { [key: number]: string } = {
        0: 'customer_inbound',
        1: 'customer_outbound',
        2: 'supplier_outbound',
        3: 'supplier_inbound',
        4: 'internal_transfer',
      };

      const mappedTransactionTypeArray: string[] = payload.transactionType.map(
        (element: number) => mappedTransactionType[element] || ''
      );

      const transactionTypeString: string = mappedTransactionTypeArray.join(',');

      params += `&transactionType=${transactionTypeString}`;
    }

    return api
      .get(`/transactions${params}`)
      .then((response: AxiosResponse<TransactionResultInterface>) => {
        if (response) {
          if (this.state.transactions.transactions.length > 0) {
            context.commit('PUSH_TRANSACTIONS', response.data.transactions);
          } else {
            context.commit('SET_TRANSACTIONS', response.data.transactions);
          }
        }
        context.commit('SET_TOTAL_AMOUNT', response.data.total);
        context.commit('SET_TOTAL_TRANSACTIONS', response.data.totalTransactions);
      });
  },

  removeTransactions(context) {
    context.commit('REMOVE_TRANSACTIONS');
  },
  createTransaction(context, payload: TransactionInterface) {
    return api.post('/transactions', payload);
  },
  editTransaction(context, payload: TransactionInterface) {
    let transactionId = 0;
    if (payload.id) {
      transactionId = payload.id;
    }
    return api.patch(`/transactions/p/${transactionId}`, payload);
  },
  async transactionReport(context, payload: PayloadTransactionReport) {
    let params = '';
    let to = '';
    let from = '';
    if (payload.pmsPropertyId) {
      params += `?pmsPropertyId=${payload.pmsPropertyId}`;
    }
    if (payload.dateFrom && payload.dateTo) {
      from = `${payload.dateFrom.getFullYear()}-${(payload.dateFrom.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${payload.dateFrom.getDate().toString().padStart(2, '0')}`;
      to = `${payload.dateTo.getFullYear()}-${(payload.dateTo.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${payload.dateTo.getDate().toString().padStart(2, '0')}`;
      params += `&dateFrom=${from}&dateTo=${to}`;
    }
    return api.get(`transactions/transactions-report${params}`);
  },
  async createDownPaymentInvoice(
    context,
    payload: {
      originDownPaymentId: number;
      partnerId: number;
    }
  ) {
    return api.post('/invoices', payload);
  },
  setCurrentTransaction(context, payload: TransactionInterface) {
    context.commit('SET_CURRENT_TRANSACTION', payload);
  },
  removeCurrentTransaction(context) {
    context.commit('REMOVE_CURRENT_TRANSACTION');
  },
};

export default actions;
