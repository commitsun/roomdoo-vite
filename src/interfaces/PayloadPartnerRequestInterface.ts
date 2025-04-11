import type { RestMetadataRequestInterface } from './RestMetadataRequestInterface';

export interface PayloadPartnerRequestInterface extends RestMetadataRequestInterface {
  name?: string;
  inHouse?: string;
  housedFrom?: Date;
  housedTo?: Date;
  isIndividual?: boolean;
  isCompany?: boolean;
  isAgency?: boolean;
  multiFieldSearch?: string;
  isRemovedPartnersBeforeSearch?: boolean;

  // REVIEW: old fields
  housedNow?: boolean;
  housedLastWeek?: boolean;
  housedLastMonth?: boolean;
  filter?: string;
  filterByType?: string;
  timeStamp?: number;
  partnerSearchField?: string;
}
