import type { ActionTree } from 'vuex';
import { api } from '@/legacy/http/axios';
import type { PropertyInterface } from '@/legacy/interfaces/PropertyInterface';
import type { AxiosResponse } from 'axios';
import type { PayloadTransactionReport } from '@/legacy/interfaces/PayloadTransactionReport';
import type { StateInterface } from '../index';
import type { PropertyStateInterface } from '.';
import { deleteCookie } from '@/legacy/utils/cookies';
import { toRaw } from 'vue';

const actions: ActionTree<PropertyStateInterface, StateInterface> = {
  async fetchProperties(context) {
    return api.get('/properties').then((response: AxiosResponse<PropertyInterface[]>) => {
      context.commit('SET_PROPERTIES', response.data);
    });
  },

  setActiveProperty(context, propertyId: number) {
    const properties = toRaw(context.state.properties);
    const numericPropertyId = Number(propertyId);
    const activeProperty = properties.find((el) => el.id === numericPropertyId);
    if (!activeProperty) {
      console.error(
        `Property with ID ${numericPropertyId} not found. Available properties:`,
        properties
      );
      return;
    }
    context.commit('SET_ACTIVE_PROPERTY', activeProperty);
  },

  reset(context) {
    deleteCookie('activePropertyId');
    context.commit('CLEAR_ACTIVE_PROPERTY');
  },

  async ineReport(context, payload: PayloadTransactionReport) {
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
    return api.get(`properties/ine-report${params}`);
  },
};

export default actions;
