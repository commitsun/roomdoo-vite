import type { Module } from 'vuex';
import type { FolioPrecheckinInterface } from '@/_legacy/interfaces/FolioPrecheckinInterface';
import type { CheckinPartnerInterface } from '@/_legacy/interfaces/CheckinPartnerInterface';
import type { StateInterface } from '../index';
import state from './state';
import actions from './actions';
import mutations from './mutations';

export interface PrecheckinStateInterface {
  folioPublicInfo: FolioPrecheckinInterface | null;
  existingCheckinPartner: CheckinPartnerInterface | null;
  areThereAnyAdultsInFolio: boolean;
}

const foliosModule: Module<PrecheckinStateInterface, StateInterface> = {
  namespaced: true,
  actions,
  mutations,
  state,
};

export default foliosModule;
