import { type RestMetadataRequestInterface } from './RestMetadataRequestInterface';

export interface PayloadFolioInterface extends RestMetadataRequestInterface {
  dateStart: Date | null;
  dateEnd: Date | null;
  propertyId: number;
  filter: string | null;
  filterByState: number | null;
  last: boolean | null;
}
