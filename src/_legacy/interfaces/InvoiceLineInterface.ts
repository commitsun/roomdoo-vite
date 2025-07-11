export interface InvoiceLineInterface {
  id: number | null;
  name: string;
  quantity: number;
  priceUnit: number;
  total: number;
  discount: number;
  displayType: string;
  saleLineId: number | null;
}
