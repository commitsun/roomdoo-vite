import type { OcrDocumentStateInterface } from '.';

function state(): OcrDocumentStateInterface {
  return {
    documentData: {
      nationality: 0,
      countryId: 0,
      firstname: '',
      lastname: '',
      lastname2: '',
      gender: '',
      birthdate: null,
      documentType: 0,
      documentSupportNumber: '',
      documentNumber: '',
      residenceStreet: '',
      residenceCity: '',
      countryState: 0,
    },
  };
}

export default state;
