import type { ProductInterface } from '@/_legacy/interfaces/ProductInterface';
import type { MutationTree } from 'vuex';
import type { ProductsStateInterface } from '.';

const mutation: MutationTree<ProductsStateInterface> = {
  SET_PRODUCTS(state: ProductsStateInterface, products: ProductInterface[]) {
    state.products = products;
  },
};

export default mutation;
