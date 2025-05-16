import type { RoomInterface } from './RoomInterfaces';

export interface AvailabilityPerDayInterface {
  date: Date;
  rooms?: RoomInterface[];
  reservationLineId?: number;
  roomId?: number;
}
