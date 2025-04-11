import type { PriceInterface } from 'src/interfaces/PriceInterface';
import type { MutationTree } from 'vuex';
import type { PricesStateInterface } from '.';

const mutation: MutationTree<PricesStateInterface> = {
  SET_PRICES(state: PricesStateInterface, prices: PriceInterface[]) {
    prices.forEach((line) => {
      line.date = new Date(line.date);
    });
    state.prices = prices;
  },
};

export default mutation;
