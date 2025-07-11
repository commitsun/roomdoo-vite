export interface ReservationMessageInterface {
  reservationId: number,
  author: string;
  message: string;
  subject: string;
  date: string;
  messageType: string;
  authorImageUrl: string;
}

export interface FolioMessageInterface {
  author: string;
  message: string;
  subject: string;
  date: string;
  messageType: string;
  authorImageUrl: string;

}

export interface MessageInterface {
  folioMessages: FolioMessageInterface[];
  reservationMessages: ReservationMessageInterface[];
}
