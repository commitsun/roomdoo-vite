import { type RestMetadataRequestInterface } from './RestMetadataRequestInterface';

export interface PayloadInvoiceRequestInterface extends RestMetadataRequestInterface {
  filter?: string;
  paymentState?: string;
  originAgencyId?: number;
  dateStart?: Date;
  dateEnd?: Date;
  pmsPropertyId: number;
}
