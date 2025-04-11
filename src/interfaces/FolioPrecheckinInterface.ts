import { type ReservationPrecheckinInterface } from './ReservationPrecheckinInterface';

export interface FolioPrecheckinInterface {
  pmsCompanyName: string;
  pmsPropertyName: string;
  pmsPropertyStreet: string;
  pmsPropertyCity: string;
  pmsPropertyState: string;
  pmsPropertyZip: string;
  pmsPropertyPhoneNumber: string;
  pmsPropertyLogo: string;
  pmsPropertyImage: string;
  pmsPropertyIneCategory: string;
  pmsPropertyIsOCRAvailable: boolean;
  pmsPropertyPrivacyPolicy: string;
  pmsPropertyId: number;
  cardexWarning: string;

  folioPartnerName: string;
  folioRoomTypesDescription: string;
  folioReference: string;
  folioPaymentLink: string;
  folioPortalLink: string;
  folioPendingAmount: number;
  folioNumCheckins: number;
  folioCheckinNamesCompleted: string[];
  reservations: ReservationPrecheckinInterface[];
}
