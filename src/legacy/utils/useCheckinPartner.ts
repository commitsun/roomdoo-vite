import type { CheckinPartnerInterface } from '@/legacy/interfaces/CheckinPartnerInterface';
import type { AxiosResponse } from 'axios';
import { isNIF } from 'better-dni';
import { useRouter } from 'vue-router';
import { useStore } from '@/legacy/store';
import utilsDates from './dates';
import { dialogService } from '@/legacy/services/DialogService';

export const DEFAULT_CHECKIN_PARTNER_VALUES = {
  birthdate: null,
  checkinPartnerState: '',
  countryId: 0,
  countryState: 0,
  documentCountryId: 0,
  documentLegalRepresentative: '',
  documentNumber: '',
  documentSupportNumber: '',
  documentType: 0,
  email: '',
  firstname: '',
  gender: '',
  id: 0,
  lastname: '',
  lastname2: '',
  mobile: '',
  name: '',
  nationality: 0,
  originInputData: '',
  relationship: '',
  residenceCity: '',
  residenceStreet: '',
  responsibleCheckinPartnerId: 0,
  reservationId: 0,
  signature: '',
  zip: '',
};

function isValidNIE(nie: string): boolean {
  const controlLetters = 'TRWAGMYFPDXBNJZSQVHLCKE';
  nie = nie.trim().toUpperCase();

  const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/;
  if (!nieRegex.test(nie)) return false;

  const prefix = nie[0];
  const numberPart = nie.slice(1, -1);
  const controlChar = nie.slice(-1);

  let numericPrefix = { X: '0', Y: '1', Z: '2' }[prefix];
  const fullNumber = parseInt(numericPrefix + numberPart, 10);
  const expectedLetter = controlLetters[fullNumber % 23];

  return controlChar === expectedLetter;
}

export function useCheckinPartner() {
  const store = useStore();
  const router = useRouter();
  const { yearsFrom } = utilsDates;
  const NATIONALITY_CODE_SPAIN = store.state.countries.countries.find((el) => el.code === 'ES')?.id;

  const saveCheckinPartner = async (checkinPartner: CheckinPartnerInterface) => {
    void store.dispatch('layout/showSpinner', true);
    try {
      if (checkinPartner) {
        await store.dispatch('checkinPartners/updateCheckinPartner', checkinPartner);
        await store.dispatch('checkinPartners/fetchCheckinPartners', checkinPartner.reservationId);
        await store.dispatch('reservations/fetchReservation', checkinPartner.reservationId);
        if (router.currentRoute.value.name === 'planning') {
          await store.dispatch('planning/fetchPlanning', {
            dateStart: store.state.planning.dateStart,
            dateEnd: store.state.planning.dateEnd,
            propertyId: store.state.properties.activeProperty?.id,
            availabilityPlanId: store.state.availabilityPlans.activeAvailabilityPlan?.id,
          });
        }
      }
    } catch {
      dialogService.open({
        header: 'Error',
        content: 'Algo ha ido mal',
        btnAccept: 'Ok',
      });
    } finally {
      void store.dispatch('layout/showSpinner', false);
    }
  };

  const base64ToArrayBuffer = (data: string) => {
    const bString = window.atob(data);
    const bLength = bString.length;
    const bytes = new Uint8Array(bLength);
    for (let i = 0; i < bLength; i += 1) {
      const ascii = bString.charCodeAt(i);
      bytes[i] = ascii;
    }
    return bytes;
  };

  const printAllCheckins = async () => {
    void store.dispatch('layout/showSpinner', true);
    try {
      const response = (await store.dispatch(
        'checkinPartners/fetchPdfAllCheckins',
        store.state.reservations.currentReservation?.id,
      )) as AxiosResponse<{ binary: string }>;
      if (response.data && response.data) {
        const content = base64ToArrayBuffer(`${response.data.binary}`);
        const blob = new Blob([content], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = url;
        document.body.appendChild(iframe);
        if (iframe) {
          iframe.contentWindow?.print();
        }
      }
    } catch {
      dialogService.open({
        header: 'Error',
        content: 'Algo ha ido mal',
        btnAccept: 'Ok',
      });
    } finally {
      void store.dispatch('layout/showSpinner', false);
    }
  };

  const printCheckin = async (checkinPartner: CheckinPartnerInterface) => {
    try {
      void store.dispatch('layout/showSpinner', true);
      await store.dispatch('checkinPartners/updateCheckinPartner', checkinPartner);
      const response = (await store.dispatch('checkinPartners/fetchPdfCheckin', {
        reservationId: store.state.reservations.currentReservation?.id,
        checkinPartnerId: checkinPartner.id,
      })) as AxiosResponse<{ binary: string }>;
      if (response.data) {
        const content = base64ToArrayBuffer(`${response.data.binary}`);
        const blob = new Blob([content], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = url;
        document.body.appendChild(iframe);
        if (iframe) {
          iframe.contentWindow?.print();
        }
      }
    } catch {
      dialogService.open({
        header: 'Error',
        content: 'Algo ha ido mal',
        btnAccept: 'Ok',
      });
    } finally {
      void store.dispatch('layout/showSpinner', false);
    }
  };

  const viewCheckinPDF = async (checkinPartner: CheckinPartnerInterface) => {
    try {
      void store.dispatch('layout/showSpinner', true);
      await store.dispatch('checkinPartners/updateCheckinPartner', checkinPartner);
      const response = (await store.dispatch('checkinPartners/fetchPdfCheckin', {
        reservationId: store.state.reservations.currentReservation?.id,
        checkinPartnerId: checkinPartner.id,
      })) as AxiosResponse<{ binary: string }>;
      if (response.data) {
        const content = base64ToArrayBuffer(`${response.data.binary}`);
        const blob = new Blob([content], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      }
    } catch (error) {
      dialogService.open({
        header: 'Error',
        content: 'Algo ha ido mal',
        btnAccept: 'Ok',
      });
    } finally {
      void store.dispatch('layout/showSpinner', false);
    }
  };

  const viewAllCheckinsPDF = async () => {
    try {
      void store.dispatch('layout/showSpinner', true);
      const response = (await store.dispatch(
        'checkinPartners/fetchPdfAllCheckins',
        store.state.reservations.currentReservation?.id,
      )) as AxiosResponse<{ binary: string }>;
      if (response.data) {
        const content = base64ToArrayBuffer(`${response.data.binary}`);
        const blob = new Blob([content], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      }
    } catch (error) {
      dialogService.open({
        header: 'Error',
        content: 'Algo ha ido mal',
        btnAccept: 'Ok',
      });
    } finally {
      void store.dispatch('layout/showSpinner', false);
    }
  };

  const doCheckin = async (checkinPartner: CheckinPartnerInterface) => {
    try {
      void store.dispatch('layout/showSpinner', true);
      await store.dispatch('checkinPartners/updateCheckinPartner', checkinPartner);
      await store.dispatch('checkinPartners/onBoardCheckinPartner', {
        reservationId: checkinPartner.reservationId,
        checkinPartnerId: checkinPartner.id,
      });
      await Promise.all([
        store.dispatch('folios/fetchFolio', store.state.folios.currentFolio?.id),
        store.dispatch('reservations/fetchReservations', store.state.folios.currentFolio?.id),
        store.dispatch('reservations/fetchReservation', checkinPartner.reservationId),
        store.dispatch(
          'checkinPartners/fetchCheckinPartners',
          store.state.reservations.currentReservation?.id,
        ),
        store.dispatch(
          'checkinPartners/fetchFolioCheckinPartners',
          store.state.folios.currentFolio?.id,
        ),
      ]);
      if (router.currentRoute.value.name === 'planning') {
        await store.dispatch('planning/fetchPlanning', {
          dateStart: store.state.planning.dateStart,
          dateEnd: store.state.planning.dateEnd,
          propertyId: store.state.properties.activeProperty?.id,
          availabilityPlanId: store.state.availabilityPlans.activeAvailabilityPlan?.id,
        });
      } else {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        await store.dispatch('dashboard/fetchPendingReservations', {
          pmsPropertyId: store.state.properties.activeProperty?.id,
          dateFrom: yesterday,
          dateTo: tomorrow,
        });
      }
    } catch {
      dialogService.open({
        header: 'Error',
        content: 'Algo ha ido mal',
        btnAccept: 'Ok',
      });
    } finally {
      void store.dispatch('layout/showSpinner', false);
    }
  };

  const doAllCheckins = async (reservationId: number) => {
    void store.dispatch('layout/showSpinner', true);
    try {
      await Promise.all(
        store.state.checkinPartners.checkinpartners.map(
          async (checkinPartner: CheckinPartnerInterface) => {
            await store.dispatch('checkinPartners/onBoardCheckinPartner', {
              reservationId,
              checkinPartnerId: checkinPartner.id,
            });
          },
        ),
      );
      await store.dispatch('reservations/fetchReservation', reservationId);
      await store.dispatch('checkinPartners/fetchCheckinPartners', reservationId);
    } catch {
      dialogService.open({
        header: 'Error',
        content: 'Algo ha ido mal',
        btnAccept: 'Ok',
      });
    } finally {
      if (router.currentRoute.value.name === 'planning') {
        await store.dispatch('planning/fetchPlanning', {
          dateStart: store.state.planning.dateStart,
          dateEnd: store.state.planning.dateEnd,
          propertyId: store.state.properties.activeProperty?.id,
          availabilityPlanId: store.state.availabilityPlans.activeAvailabilityPlan?.id,
        });
      }
      void store.dispatch('layout/showSpinner', false);
    }
  };

  const validateDocumentNumber = (
    documentType: string,
    documentNumber: string,
    documentCountryId: number,
  ) => {
    let result = true;
    if (
      (documentType === 'D' &&
        !isNIF(documentNumber) &&
        documentCountryId === NATIONALITY_CODE_SPAIN) ||
      (documentType === 'N' && !isValidNIE(documentNumber))
    ) {
      result = false;
    }
    return result;
  };

  const validateSupportNumber = (supportNumber: string, documentType: string) => {
    let regex;
    if (documentType === 'D') {
      regex = /^[A-Za-z]{3}\d{6}$/;
    } else {
      regex = /^E\d{8}$/;
    }
    return regex.test(supportNumber);
  };

  const checkSpanishDocument = (
    partner: CheckinPartnerInterface,
    isDNI: boolean,
    isNIE: boolean,
  ): boolean => {
    if (!isDNI && !isNIE) return true;
    if (isDNI) return Boolean(partner.documentSupportNumber && partner.lastname2);
    if (isNIE) return Boolean(partner.documentSupportNumber);
    return false;
  };

  const checkSpanishResidence = (
    partner: CheckinPartnerInterface,
    livesInSpain: boolean,
  ): boolean => {
    const result = !livesInSpain || (!!partner.countryState && partner.countryState !== 0);
    return result;
  };

  const checkinMandatoryDataComplete = (
    partner: CheckinPartnerInterface,
    isDNI: boolean,
    isNIE: boolean,
    livesInSpain: boolean,
  ): boolean => {
    let isUnderFourteen = false;
    let isUnderEighteen = false;
    if (partner && partner.birthdate) {
      isUnderFourteen = partner.birthdate && yearsFrom(new Date(partner.birthdate)) < 14;
      isUnderEighteen = partner.birthdate && yearsFrom(new Date(partner.birthdate)) < 18;
    }

    const result = Boolean(
      partner &&
        partner.firstname &&
        partner.lastname &&
        partner.gender &&
        partner.birthdate &&
        partner.nationality &&
        partner.nationality !== 0 &&
        partner.countryId &&
        partner.countryId !== 0 &&
        partner.residenceCity &&
        partner.residenceStreet &&
        partner.zip &&
        ((isUnderEighteen &&
          (partner.documentLegalRepresentative || partner.responsibleCheckinPartnerId) &&
          partner.relationship) ||
          !isUnderEighteen) &&
        (isUnderFourteen ||
          (partner.documentCountryId &&
            partner.documentCountryId !== 0 &&
            partner.documentType &&
            partner.documentType !== 0 &&
            partner.documentNumber)) &&
        checkSpanishDocument(partner, isDNI, isNIE) &&
        checkSpanishResidence(partner, livesInSpain),
    );
    return result;
  };

  return {
    saveCheckinPartner,
    doCheckin,
    doAllCheckins,
    printCheckin,
    printAllCheckins,
    validateDocumentNumber,
    validateSupportNumber,
    checkinMandatoryDataComplete,
    viewCheckinPDF,
    viewAllCheckinsPDF,
  };
}
