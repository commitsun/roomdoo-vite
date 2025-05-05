import type { PrecheckinStateInterface } from '.';

function state(): PrecheckinStateInterface {
  return {
    folioPublicInfo: null,
    existingCheckinPartner: null,
    areThereAnyAdultsInFolio: false,
  };
}

export default state;
