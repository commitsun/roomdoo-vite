import type { Module } from 'vuex';
import type { ProductInterface } from '@/_legacy/interfaces/ProductInterface';
import type { StateInterface } from '../index';
import state from './state';
import actions from './actions';
import mutations from './mutations';

export interface ProductsStateInterface {
  products: ProductInterface[];
}

const productsModule: Module<ProductsStateInterface, StateInterface> = {
  namespaced: true,
  actions,
  mutations,
  state,
};

export default productsModule;
