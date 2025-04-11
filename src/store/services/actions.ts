import type { ActionTree } from 'vuex';
import type { AxiosResponse } from 'axios';
import type { ServiceInterface } from '@/interfaces/ServiceInterface';
import type { ServiceLineInterface } from '@/interfaces/ServiceLineInterface';
import type { PayloadTransactionReport } from '@/interfaces/PayloadTransactionReport';
import { api } from '@/plugins/axios';

import type { StateInterface } from '../index';
import type { ServiceStateInterface } from '.';

interface PayloadServiceCreation {
  reservationId: number;
  serviceId: number;
  productId: number;
  serviceLines: ServiceLineInterface[];
}

const actions: ActionTree<ServiceStateInterface, StateInterface> = {
  async fetchServices(context, reservationId: number) {
    return api
      .get(`reservations/${reservationId}/services`)
      .then((response: AxiosResponse<ServiceInterface[]>) => {
        context.commit('SET_SERVICES', response.data);
      });
  },

  async fetchFolioServices(context, reservationIds: number[]) {
    context.commit('CLEAR_FOLIO_SERVICES');
    await reservationIds.reduce(async (acc, reservationId) => {
      await acc;
      await api
        .get(`/reservations/${reservationId}/services`)
        .then((response: AxiosResponse<ServiceInterface[]>) => {
          context.commit('ADD_FOLIO_SERVICES', response.data);
        });
    }, undefined as unknown);
  },

  async deleteService(context, serviceId: number) {
    return api.delete(`services/${serviceId}`);
  },

  async createService(context, service: PayloadServiceCreation) {
    return api.post(`/reservations/${service.reservationId}/services`, {
      productId: service.productId,
      serviceLines: service.serviceLines.map((el) => ({
        date: `${(el.date as Date).getFullYear()}-${((el.date as Date).getMonth() + 1)
          .toString()
          .padStart(2, '0')}-${(el.date as Date).getDate().toString().padStart(2, '0')}`,
        discount: el.discount,
        priceUnit: el.priceUnit,
        quantity: el.quantity,
      })),
    });
  },

  async updateService(context, service: PayloadServiceCreation) {
    return api.patch(`/services/p/${service.serviceId}`, {
      serviceId: service.serviceId,
      serviceLines: service.serviceLines.map((el) => ({
        id: el.id,
        date: `${new Date(el.date as Date).getFullYear()}-${(
          new Date(el.date as Date).getMonth() + 1
        )
          .toString()
          .padStart(2, '0')}-${new Date(el.date as Date).getDate().toString().padStart(2, '0')}`,
        discount: el.discount,
        priceUnit: el.priceUnit,
        quantity: el.quantity,
      })),
    });
  },
  async servicesReport(context, payload: PayloadTransactionReport) {
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
    return api.get(`services/services-report${params}`);
  },
};

export default actions;
