import type { Module } from 'vuex';

import type { NotificationInterface } from '@/_legacy/interfaces/NotificationInterface';
import type { StateInterface } from '../index';
import state from './state';
import actions from './actions';
import mutations from './mutations';

export interface NotificationsStateInterface {
  notifications: NotificationInterface[];
  numReservationsToAssign: number;
}

const notificationsModule: Module<NotificationsStateInterface, StateInterface> = {
  namespaced: true,
  actions,
  mutations,
  state,
};

export default notificationsModule;
