import { type RestMetadataRequestInterface } from './RestMetadataRequestInterface';

export interface PayloadFolioInterface extends RestMetadataRequestInterface {
  dateStart: Date | null;
  dateEnd: Date | null;
  checkinDate: Date | null;
  checkoutDate: Date | null;
  propertyId: number;
  filter: string | null;
  filterByState: number | null;
  last: boolean | null;
  pendingCheckin: boolean | null;
  completedCheckin: boolean | null;
  pendingCheckout: boolean | null;
  completedCheckout: boolean | null;
}
