import type { PricelistStateInterface } from '.';

function state(): PricelistStateInterface {
  return {
    pricelists: [],
    dailyPricelists: [],
    activePricelist: null,
    pricelistItems: [],
    restrictedPricelist: null,
  };
}

export default state;
