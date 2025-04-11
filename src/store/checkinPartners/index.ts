import type { Module } from 'vuex';
import type { CheckinPartnerInterface } from 'src/interfaces/CheckinPartnerInterface';
import type { StateInterface } from '../index';
import state from './state';
import actions from './actions';
import mutations from './mutations';

export interface CheckinPartnerStateInterface {
  checkinpartners: CheckinPartnerInterface[];
  checkinPartner: CheckinPartnerInterface | null;
  folioCheckinPartners: CheckinPartnerInterface[];
}

const checkinPartnerModule: Module<CheckinPartnerStateInterface, StateInterface> = {
  namespaced: true,
  actions,
  mutations,
  state,
};

export default checkinPartnerModule;
