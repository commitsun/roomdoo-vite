export interface DateRangeInterface {
  dateStart: Date;
  dateEnd: Date;
  propertyId: number;
  roomIds?: number[];
  availabilityPlanId?: number;
  pricelistId?: number;
}
