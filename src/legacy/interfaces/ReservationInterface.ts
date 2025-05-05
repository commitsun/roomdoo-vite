import { type PlanningReservationLineInterface } from './PlanningReservationLineInterface';
import { type ServiceInterface } from './ServiceInterface';

export interface ReservationInterface {
  id: number;
  checkin: Date | string;
  checkout: Date | string;
  roomTypeId: number;
  roomTypeClassId?: number;
  adults?: number;
  saleChannelId?: number;
  children?: number;
  saleChannel?: string;
  reservationLines?: PlanningReservationLineInterface[];
  services?: ServiceInterface[];

  reservationType: string;
  pricelistId?: number;
  folioId?: number;
  folioSequence?: number;
  name?: string;
  preferredRoomId?: number;
  preferredRoomCapacity?: number;
  roomTypeName?: string;
  priceTotal?: number;
  priceTax?: number;
  priceOnlyRoom?: number;
  priceRoomServicesSet?: number;
  priceOnlyServices?: number;
  discount?: number;
  servicesDiscount?: number;
  commissionAmount?: number;
  commissionPercent?: number;
  partnerName?: string;
  partnerId?: number;
  boardServiceId?: number;
  agencyId?: number;
  agency?: string;
  externalReference?: string;
  userId?: number;
  agencyImage?: string;
  stateCode?: string;
  roomTypeCode?: string;
  countServices?: number;
  readyForCheckin?: boolean;
  allowedCheckout?: boolean;
  checkinPartnerCount?: number;
  isSplitted: boolean;
  arrivalHour?: string;
  departureHour?: string;
  pendingCheckinData?: number;
  createDate?: Date;
  createdBy?: string;
  segmentationId?: number;
  cancellationPolicy?: string;
  pendingPayment?: number;
  toAssign?: boolean;
  toCheckout?: boolean;
  overbooking?: boolean;
  stateDescription?: string;
  partnerRequests?: string;
  numServices?: number;
  nights?: number;
  cancelledReason?: string;
  isReselling?: boolean;
  isBlocked?: boolean;
  isOverNightRoom?: boolean;
}

export interface ReservationApiInterface extends ReservationInterface {
  checkin: string;
  checkout: string;
}
