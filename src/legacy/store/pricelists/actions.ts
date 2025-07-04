import type { ActionTree } from 'vuex';
import type { AxiosResponse } from 'axios';
import { api } from '@/legacy/http/axios';
import type { PricelistInterface } from '@/legacy/interfaces/PricelistInterface';
import type { PayloadPricelistItemsInterface } from '@/legacy/interfaces/PayloadPricelistItemsInterface';
import type { PricelistItemInterface } from '@/legacy/interfaces/PricelistItemInterface';
import type { StateInterface } from '../index';
import type { PricelistStateInterface } from '.';

const actions: ActionTree<PricelistStateInterface, StateInterface> = {
  async fetchPricelists(
    context,
    payload: {
      pmsPropertyId: number;
      saleChannelId?: number;
    }
  ) {
    let params = `?pmsPropertyId=${payload.pmsPropertyId}`;
    if (payload.saleChannelId) {
      params += `&saleChannelId=${payload.saleChannelId}`;
    }
    return api.get(`/pricelists${params}`).then((response) => {
      context.commit('SET_PRICELISTS', response.data);
    });
  },

  async fetchDailyPricelists(
    context,
    payload: {
      pmsPropertyId: number;
    }
  ) {
    const params = `?pmsPropertyId=${payload.pmsPropertyId}&daily=true`;
    return api.get(`/pricelists${params}`).then((response) => {
      context.commit('SET_DAILY_PRICELISTS', response.data);
    });
  },

  setActivePricelist(context, pricelist: PricelistInterface) {
    context.commit('SET_ACTIVE_PRICELIST', pricelist);
  },

  async fetchPricelistItems(context, payload: PayloadPricelistItemsInterface) {
    let to = '';
    let from = '';
    let params = '';
    if (payload.dateFrom && payload.dateTo) {
      from = `${payload.dateFrom.getFullYear()}-${(payload.dateFrom.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${payload.dateFrom.getDate().toString().padStart(2, '0')}`;
      to = `${payload.dateTo.getFullYear()}-${(payload.dateTo.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${payload.dateTo.getDate().toString().padStart(2, '0')}`;
      params = `?dateFrom=${from}&dateTo=${to}&pmsPropertyId=${payload.propertyId}`;
    }
    return api
      .get(`/pricelists/${payload.pricelistId}/pricelist-items${params}`)
      .then((response: AxiosResponse<PricelistItemInterface[]>) => {
        context.commit('SET_PRICELIST_ITEMS', response.data);
      });
  },

  async createPricelistItem(context, payload: PricelistItemInterface) {
    let pricelistId = '';
    if (context.state.activePricelist?.id) {
      pricelistId = context.state.activePricelist.id.toString();
    }
    return api.post(`/pricelists/${pricelistId}/pricelist-items`, payload).then(() => {
      context.commit('UPDATE_PRICELIST_ITEM', payload);
    });
  },
  async createOrUpdatePricelistItems(
    _context,
    payload: { pricelistId: number; pricelistItems: PricelistItemInterface[] }
  ) {
    return api.patch(`/pricelists/p/${payload.pricelistId}/pricelist-items`, payload);
  },

  async batchChangesPricelistItems(
    _context,
    payload: {
      pricelistItems: PricelistItemInterface[];
    }
  ) {
    return api.post('/pricelists/batch-changes', payload);
  },

  async fetchRestrictedPricelist(context, pricelistId: number) {
    return api.get(`/pricelists/restricted/${pricelistId}`).then((response) => {
      context.commit('SET_RESTRICTED_PRICELIST', response.data);
    });
  },
};

export default actions;
