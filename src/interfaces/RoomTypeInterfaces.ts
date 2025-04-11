export interface RoomTypeInterface {
  id: number;
  name: string;
  visible: boolean;
  defaultCode: string;
  price: number;
  minPrice: number;
  classId: number;
  defaultQuota: number;
  defaultMaxAvail: number;
}
