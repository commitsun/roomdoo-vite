import type { PricelistInterface } from '@/interfaces/PricelistInterface';
import type { PricelistItemInterface } from '@/interfaces/PricelistItemInterface';

import type { MutationTree } from 'vuex';
import type { PricelistStateInterface } from '.';

const mutation: MutationTree<PricelistStateInterface> = {
  SET_PRICELISTS(state: PricelistStateInterface, pricelists: PricelistInterface[]) {
    state.pricelists = pricelists;
  },
  SET_DAILY_PRICELISTS(state: PricelistStateInterface, pricelists: PricelistInterface[]) {
    state.dailyPricelists = pricelists;
  },
  SET_PRICELIST_ITEMS(state: PricelistStateInterface, pricelistItems: PricelistItemInterface[]) {
    pricelistItems.forEach((el) => {
      el.date = new Date(el.date);
    });
    state.pricelistItems = pricelistItems;
  },
  SET_ACTIVE_PRICELIST(state: PricelistStateInterface, pricelist: PricelistInterface) {
    state.activePricelist = pricelist;
  },
  SET_RESTRICTED_PRICELIST(state: PricelistStateInterface, pricelist: PricelistInterface) {
    state.restrictedPricelist = pricelist;
  },
  UPDATE_PRICELIST_ITEM(state: PricelistStateInterface, pricelistItem: PricelistItemInterface) {
    const { price } = pricelistItem;
    state.pricelistItems.forEach((el) => {
      if (el.roomTypeId === pricelistItem.roomTypeId && el.date === pricelistItem.date) {
        el.price = price;
        el.pricelistItemId = pricelistItem.pricelistItemId;
      }
    });
  },
};

export default mutation;
