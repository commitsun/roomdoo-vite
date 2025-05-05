export interface PayloadAvailabilityRoomsInterface {
  pmsPropertyId: number;
  availabilityFrom: Date;
  availabilityTo: Date;
  pricelistId?: number;
  currentLines?: number[];
}
