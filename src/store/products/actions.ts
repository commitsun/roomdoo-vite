import type { ActionTree } from 'vuex';
import type { AxiosResponse } from 'axios';
import type { ProductInterface } from 'src/interfaces/ProductInterface';
import { api } from '@/plugins/axios';

import type { StateInterface } from '../index';
import type { ProductsStateInterface } from '.';

const actions: ActionTree<ProductsStateInterface, StateInterface> = {
  async fetchProducts(context, pmsPropertyId: number) {
    return api
      .get(`/products?pmsPropertyId=${pmsPropertyId}`)
      .then((response: AxiosResponse<ProductInterface[]>) => {
        context.commit('SET_PRODUCTS', response.data);
      });
  },
  async fetchProductsByName(context, payload: { pmsPropertyId: number; name: string }) {
    return api
      .get(`/products?pmsPropertyId=${payload.pmsPropertyId}&name=${payload.name}`)
      .then((response: AxiosResponse<ProductInterface[]>) => {
        context.commit('SET_PRODUCTS', response.data);
      });
  },
};

export default actions;
