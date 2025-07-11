export interface CheckinPartnerInterface {
  id: number;
  reservationId?: number;
  partnerId?: number;
  checkinPartnerState?: string;
  originInputData?: string;
  signature?: string;
  signOn?: Date | null;

  // document data
  documentCountryId: number;
  documentType: number;
  documentNumber: string;
  documentSupportNumber: string;

  // name data
  name?: string;
  firstname: string;
  lastname: string;
  lastname2: string;

  // nationality data
  nationality: number;

  // personal data
  gender: string;
  birthdate: Date | null,
  relationship?: string;
  responsibleCheckinPartnerId?: number;
  documentLegalRepresentative?: string;

  // residence data
  countryId: number;
  zip: string;
  countryState: number;
  countryStateName?: string;
  residenceCity: string
  residenceStreet: string;

  // contact data
  email?: string;
  mobile?: string;

  isAlreadyInReservation?: boolean;
}
