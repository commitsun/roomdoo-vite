import { type ReservationApiInterface, type ReservationInterface } from './ReservationInterface';

export interface FolioInterface {
  pmsPropertyId: number;
  partnerId?: number;
  reservations: ReservationInterface[];
  numReservations?: number;
  saleChannelId?: number;
  agencyId?: number;
  externalReference?: string;

  id?: number;
  name?: string;
  partnerName?: string;
  partnerPhone?: string;
  partnerEmail?: string;
  saleChannel?: string;
  agency?: string;
  state?: string;
  paymentStateCode?: string;
  amountTotal?: number;
  salesPerson?: string;
  PaymentState?: string;
  agencyImage?: string;
  reservationType: string;
  pricelistId?: number;
  closureReasonId?: number;
  outOfServiceDescription?: string;
  pendingAmount?: number;
  firstCheckin?: string;
  lastCheckout?: string;
  createDate?: Date;
  createHour?: string;
  createdBy?: string;
  preconfirm?: boolean;
  internalComment?: string;
  sendConfirmationMail?: boolean;
  language?: string;
  invoiceStatus?: string;
  portalUrl?: string;
  accessToken?: string;
}

export interface FolioApiInterface extends FolioInterface {
  reservations: ReservationApiInterface[];
}
