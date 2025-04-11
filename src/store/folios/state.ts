import type { FoliosStateInterface } from '.';

function state(): FoliosStateInterface {
  return {
    currentFolio: null,
    folios: [],
    foliosPlanning: [],
    transactions: [],
    saleLines: [],
    invoices: [],
    lastFolioFilters: null,
    folioMessages: null,
    messages: null,
    adultsInFolio: [],
  };
}

export default state;
