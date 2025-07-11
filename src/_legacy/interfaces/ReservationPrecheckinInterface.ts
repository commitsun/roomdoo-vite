import { type CheckinPartnerInterface } from './CheckinPartnerInterface';

export interface ReservationPrecheckinInterface {
  id: number;
  roomTypeName: string;
  reservationReference: string;
  checkinNamesCompleted: string[];
  accessToken: string;
  nights: number;
  checkin: Date;
  checkout: Date;
  adults: number;
  children: number;
  reservationAmount: number;
  checkinPartners: CheckinPartnerInterface[];
}
