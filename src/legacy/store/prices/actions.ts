import type { ActionTree } from 'vuex';
import type { AxiosResponse } from 'axios';
import type { PriceInterface } from '@/legacy/interfaces/PriceInterface';
import type { PayloadPriceRequestInterface } from '@/legacy/interfaces/PayloadPriceRequestInterface';
import { api } from '@/legacy/http/axios';

import type { StateInterface } from '../index';
import type { PricesStateInterface } from '.';

const actions: ActionTree<PricesStateInterface, StateInterface> = {
  async fetchPrices(context, payload: PayloadPriceRequestInterface) {
    const from = `${payload.dateFrom.getFullYear()}-${(payload.dateFrom.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${payload.dateFrom.getDate().toString().padStart(2, '0')}`;
    const to = `${payload.dateTo.getFullYear()}-${(payload.dateTo.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${payload.dateTo.getDate().toString().padStart(2, '0')}`;
    let params = `?pmsPropertyId=${payload.pmsPropertyId}&pricelistId=${payload.pricelistId}`;
    if (payload.roomTypeId) {
      // room type
      params += `&roomTypeId=${payload.roomTypeId}`;
    } else if (payload.productId && payload.boardServiceId) {
      // board service & product id
      params += `&productId=${payload.productId}`;
      params += `&boardServiceId=${payload.boardServiceId}`;
    } else if (payload.productId) {
      // product id
      params += `&productId=${payload.productId}`;
    } else if (payload.boardServiceId) {
      // board service
      params += `&boardServiceId=${payload.boardServiceId}`;
    }
    if (payload.boardServiceLineId) {
      params += `&boardServiceLineId=${payload.boardServiceLineId}`;
    }

    if (payload.isAdults) {
      // adults
      params += `&isAdults=${payload.isAdults.toString()}`;
    } else if (payload.isChildren) {
      // children
      params += `&isChildren=${payload.isChildren.toString()}`;
    }
    params += `&dateFrom=${from}&dateTo=${to}`;
    return api.get(`/prices${params}`).then((response: AxiosResponse<PriceInterface[]>) => {
      context.commit('SET_PRICES', response.data);
    });
  },
};

export default actions;
