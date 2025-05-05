import { type ReservationLineInterface } from './ReservationLineInterface';
import { type ServiceLineInterface } from './ServiceLineInterface';

export interface RoomTypeSelectorInterface {
  id: number;
  numRoomsToOccupy: number;
}

export interface ReservationsToCreateInterface {
  expanded: boolean;
  editable: boolean;
  modified: boolean;
  autoAssignRoom: boolean;
  isSplittedAvailability: boolean;
  id: number;
  checkin: Date;
  checkout: Date;
  roomTypeId: number;
  roomTypeClassId: number;
  roomId: number;
  boardServiceId: number;
  roomPrice: number;
  boardServicePrice: number;
  adults: number;
  children: number;
  extraServices: {
    productId: number;
    name: string;
    perPerson?: boolean;
    items: ServiceLineInterface[];
    isBoardService: boolean;
    boardServiceLineId?: number;
    _uuid?: string;
  }[];
  boardServices: {
    productId: number;
    name: string;
    perPerson?: boolean;
    items: ServiceLineInterface[];
    isBoardService: boolean;
  }[];
  reservationLines: ReservationLineInterface[];
  selected?: boolean;
  availRoomIds: number[];
}

export interface RoomTypeReservationsToCreateInterface {
  roomTypeId: number;
  expanded: boolean;
  reservations: ReservationsToCreateInterface[];
  editable: boolean;
}
