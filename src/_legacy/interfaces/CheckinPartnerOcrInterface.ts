export interface CheckinPartnerOcrInterface {
    // document data
    documentCountryId?: number;
    documentType?: number;
    documentNumber?: string;
    documentSupportNumber?: string;

    // name data
    firstname?: string;
    lastname?: string;
    lastname2?: string;

    // nationality
    nationality?: number;

    // personal data
    gender?: string;
    birthdate?: Date | null;

    // residence data
    countryId?: number;
    zip?: string;
    countryState?: number;
    residenceCity?: string;
    residenceStreet?: string;
}
