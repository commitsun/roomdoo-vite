export interface PlanningReservationLineInterface {
  id: number;
  state: string;
  date: Date;
  roomId: number;
  toAssign: boolean;
  splitted: boolean;
  partnerName: string;
  folioId: number;
  reservationId: number;
  reservationType: string;
  isFirstNight: boolean;
  isLastNight: boolean;
  totalPrice: number;
  priceDayTotal: number;
  priceDayTotalServices: number;
  pendingPayment: number;
  adults: number;
  nextLineSplitted: boolean;
  previousLineSplitted: boolean;
  closureReasonId: number;
  isReselling: boolean;
  children: number;
  isWarningToInvoice: boolean;
}
