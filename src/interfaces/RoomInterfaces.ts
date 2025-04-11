export interface RoomInterface {
  id: number;
  name: string;
  roomTypeId: number;
  roomTypeClassId: number;
  ubicationId: number;
  capacity: number;
  shortName: string;
  extraBedsAllowed: number;
  roomAmenityIds: number[] | null;
  roomAmenityInName: string;
}
