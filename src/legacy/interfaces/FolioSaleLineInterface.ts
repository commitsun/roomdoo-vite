export interface FolioSaleLineInterface {
  id: number;
  name: string;
  priceUnit: number;
  productQty: number;
  priceTotal: number;
  qtyInvoiced: number;
  qtyToInvoice: number;
  reservationId: number;
  serviceId: number;
  discount:number;
  displayType: string;
  defaultInvoiceTo: number;
  sectionId: number;
}
