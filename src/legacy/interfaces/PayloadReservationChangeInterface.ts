import { type ReservationLineInterface } from './ReservationLineInterface';
import { type ServiceInterface } from './ServiceInterface';

export interface PayloadReservationChangeInterface {
  pricelistId: number;
  reservationId: number;
  roomTypeId: number;
  checkin?: Date;
  checkout?: Date;
  adults?: number;
  children?: number;
  segmentationId?: number;
  boardServiceId?: number;
  boardServices: ServiceInterface[];
  reservationLines?: ReservationLineInterface[];
  partnerName?: string;
  partnerEmail?: string;
  partnerPhone?: string;
  partnerId?: number;
  partnerRequests?: string;
}
