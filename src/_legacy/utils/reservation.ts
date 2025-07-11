import type { ReservationInterface } from '@/_legacy/interfaces/ReservationInterface';
import type { PropertyInterface } from '@/_legacy/interfaces/PropertyInterface';

export const reservationStateText = (reservation: ReservationInterface): string => {
  let result = '';

  if (reservation.reservationType !== 'out') {
    if (reservation.stateCode === 'confirm' || reservation.stateCode === 'arrival_delayed') {
      result = 'Por llegar';
    } else if (
      reservation.stateCode === 'onboard' ||
      reservation.stateCode === 'departure_delayed'
    ) {
      result = 'Inhouse';
    } else if (reservation.stateCode === 'done') {
      result = 'Completada';
    } else if (reservation.stateCode === 'cancel') {
      if (reservation.cancelledReason === 'late') {
        result = 'Cancelada CC';
      } else if (reservation.cancelledReason === 'intime') {
        result = 'Cancelada SC';
      } else if (reservation.cancelledReason === 'noshow') {
        result = 'No show';
      } else if (reservation.cancelledReason === 'modified') {
        result = 'Modificada';
      } else {
        result = 'Cancelada';
      }
    } else if (reservation.toAssign && reservation.stateCode !== 'cancel') {
      result = 'Por asignar';
    } else if (reservation.stateCode === 'draft') {
      result = 'Presupuesto';
    } else if (reservation.isReselling && reservation.stateCode !== 'cancel') {
      result = 'Reselling';
    }
    if (reservation.overbooking) {
      if (window.innerWidth < 1024) {
        result = 'OverBkng.';
      } else {
        result = 'Overbooking';
      }
    }
  } else {
    const now = new Date();
    const checkin = new Date(reservation.checkin);
    const checkout = new Date(reservation.checkout);
    result = 'Completada';
    if (reservation.stateCode === 'confirm' || reservation.stateCode === 'draft') {
      if (now.getTime() >= checkin.getTime() && now.getTime() < checkout.getTime()) {
        result = 'Activa';
      } else if (now.getTime() < checkin.getTime()) {
        result = 'Programada';
      }
    } else if (reservation.stateCode === 'cancel') {
      result = 'Cancelada';
    }
  }

  return result;
};

const reservationColor = (
  reservation: ReservationInterface,
  folioPendingAmount: number,
  activeProperty: PropertyInterface | undefined
) => {
  let result;
  if (activeProperty?.colorOptionConfig === 'advanced') {
    if (reservation.stateCode === 'confirm' || reservation.stateCode === 'arrival_delayed') {
      result = activeProperty.confirmedReservationColor;
    }
    if (reservation.stateCode === 'draft') {
      result = activeProperty.preReservationColor;
    }
    if (reservation.stateCode === 'onboard' || reservation.stateCode === 'departure_delayed') {
      if (folioPendingAmount > 0) {
        result = activeProperty.onBoardReservationColor;
      } else if (folioPendingAmount === 0) {
        result = activeProperty.paidCheckinReservationColor;
      }
    }
    if (reservation.stateCode === 'done') {
      if (folioPendingAmount > 0) {
        result = activeProperty.outReservationColor;
      } else if (folioPendingAmount === 0) {
        result = activeProperty.paidReservationColor;
      }
    }
    if (reservation.toAssign === true) {
      result = activeProperty.toAssignReservationColor;
    }
    if (folioPendingAmount < 0) {
      result = activeProperty.overPaymentColor;
    }
    if (reservation.reservationType === 'staff') {
      result = activeProperty.staffReservationColor;
    }
    if (reservation.stateCode === 'cancel') {
      result = '#7C7C7C';
    }
  } else {
    if (reservation.stateCode === 'cancel' || reservation.stateCode === 'done') {
      result = activeProperty?.simpleOutColor;
    }
    if (reservation.stateCode === 'onboard' || reservation.stateCode === 'departure_delayed') {
      result = activeProperty?.simpleInColor;
    }
    if (
      reservation.stateCode === 'confirm' ||
      reservation.stateCode === 'arrival_delayed' ||
      reservation.stateCode === 'draft'
    ) {
      result = activeProperty?.simpleFutureColor;
    }
  }
  if (reservation.reservationType === 'out') {
    result = '#ABDEFE';
  }
  if (reservation.overbooking) {
    result = '#FF4E00';
  }
  return result;
};

export default {
  reservationStateText,
  reservationColor,
};
