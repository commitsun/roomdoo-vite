import type { Module } from 'vuex';
import type { StateInterface } from '../index';
import state from './state';
import actions from './actions';
import mutations from './mutations';

export type ViewType =
  | 'FolioList'
  | 'FolioDetail'
  | 'ReservationDetail'
  | 'NewFolioStep1'
  | 'NewFolioStep2'
  | 'PropertySelector'
  | 'PartnerDetail'
  | 'TransactionDetailMobile';

export interface LayoutStateInterface {
  rightDrawerExpanded: boolean;
  leftDrawerExpanded: boolean;
  leftDrawerHovered: boolean;
  showing: ViewType;
  pricelistPlanningExpanded: boolean;
  popUpOpen: string;
  rightDrawerSearchParam: string;
  rightDrawerFilter: string;
  forceMoveFolioTab: string;
  showSpinner: boolean;
  isMoveToGuestsTab: boolean;
}

const layoutModule: Module<LayoutStateInterface, StateInterface> = {
  namespaced: true,
  actions,
  mutations,
  state,
};

export default layoutModule;
