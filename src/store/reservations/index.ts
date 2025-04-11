import type { Module } from 'vuex';
import type { ReservationInterface } from '@/interfaces/ReservationInterface';
import type { ReservationWizardStateInterface } from '@/interfaces/ReservationWizardStateInterface';
import type { StateInterface } from '../index';
import state from './state';
import actions from './actions';
import mutations from './mutations';

export interface ReservationStateInterface {
  reservations: ReservationInterface[] | null;
  currentReservation: ReservationInterface | null;
  reservationsForPartnerAsHost: ReservationInterface[];
  reservationsForPartnerAsCustomer: ReservationInterface[];
  reservationsToAssign: ReservationInterface[];
  reservationsWizardState: ReservationWizardStateInterface | null;
}
const reservationsModule: Module<ReservationStateInterface, StateInterface> = {
  namespaced: true,
  actions,
  mutations,
  state,
};

export default reservationsModule;
