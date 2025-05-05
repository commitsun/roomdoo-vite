import { type FolioInterface } from '@/legacy/interfaces/FolioInterface';
import { type ReservationInterface } from '@/legacy/interfaces/ReservationInterface';

export const folioStateText = (folio: FolioInterface) => {
  const now = new Date();
  const firstCheckin = new Date(folio.firstCheckin as string);
  const lastCheckout = new Date(folio.lastCheckout as string);
  let result = 'Completado';

  if (folio.state === 'cancel') {
    result = 'Cancelado';
  }
  if (folio.reservationType === 'out') {
    if (folio.state === 'confirm' || folio.state === 'draft') {
      if (now.getTime() >= firstCheckin.getTime() && now.getTime() < lastCheckout.getTime()) {
        result = 'Activo';
      } else if (now.getTime() < firstCheckin.getTime()) {
        result = 'Programado';
      }
    }
  } else if (folio.state === 'draft') {
    result = 'Presupuesto';
  } else if (folio.state === 'confirm') {
    result = 'Confirmado';
  }
  return result;
};

export const isAllowedAddRooms = (folio: FolioInterface) => {
  let result = false;
  if (folio.state !== 'done' && folio.state !== 'cancel') {
    result = true;
  }
  return result;
};

export const isAllowedBatchChanges = (
  folio: FolioInterface,
  reservations?: ReservationInterface[]
) => {
  let result = false;
  const folioReservations = !reservations ? folio.reservations : reservations;
  if (
    folio.state !== 'done' &&
    folio.state !== 'cancel' &&
    folio.reservationType !== 'out' &&
    !(
      folioReservations?.filter((el) => el.isSplitted || el.stateCode === 'cancel').length ===
      folioReservations?.length
    )
  ) {
    result = true;
  }
  return result;
};

export const isAllowedConfirmReservations = (
  folio: FolioInterface,
  reservations?: ReservationInterface[]
) => {
  let result = false;
  const folioReservations = !reservations ? folio.reservations : reservations;
  if (folioReservations?.some((el) => el.stateCode === 'draft' || el.stateCode === 'cancel')) {
    result = true;
  }
  return result;
};

export const isAllowedCancelReservations = (
  folio: FolioInterface,
  reservations?: ReservationInterface[]
) => {
  let result = false;
  const folioReservations = !reservations ? folio.reservations : reservations;
  if (
    folioReservations?.some(
      (el) =>
        el.stateCode === 'draft' || el.stateCode === 'confirm' || el.stateCode === 'arrival_delayed'
    ) &&
    !(folio.reservationType === 'out' && folio.state === 'done')
  ) {
    result = true;
  }
  return result;
};

export default {
  isAllowedAddRooms,
  isAllowedBatchChanges,
  isAllowedConfirmReservations,
  isAllowedCancelReservations,
  folioStateText,
};
