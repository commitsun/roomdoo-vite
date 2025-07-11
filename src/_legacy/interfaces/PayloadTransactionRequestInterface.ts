import { type RestMetadataRequestInterface } from './RestMetadataRequestInterface';

export interface PayloadTransactionRequestInterface extends RestMetadataRequestInterface {
  filter?: string;
  pmsPropertyId: number;
  dateStart: Date;
  dateEnd: Date;
  transactionMethodId?: number;
  transactionType: number[];
  transactionTypes?: number[];
}
