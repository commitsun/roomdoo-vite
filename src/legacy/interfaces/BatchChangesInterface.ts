import { type ReservationLineInterface } from './ReservationLineInterface';
import { type ServiceLineInterface } from './ServiceLineInterface';

export interface ExtraServiceInterface {
  serviceId?: number;
  productId: number;
  name: string;
  items: ServiceLineInterface[];
  isBoardService: boolean;
  fromBatchChanges: boolean;
  boardServiceLineId?: number;
  _uuid?: string;
}
export interface BatchChangesInterface {
  id: number;
  checkin: Date;
  checkout: Date;
  roomTypeId: number;
  roomId: number;
  pricelistId: number;
  boardServiceId: number;
  reservationLines: ReservationLineInterface[];
  extraServices: ExtraServiceInterface[];
  adults: number;
  children: number;
  selected: boolean;
  isSplitted: boolean;
  stateCode: string;
}
