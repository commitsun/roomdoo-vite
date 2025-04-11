import type { ActionTree } from 'vuex';
import type { LayoutStateInterface, ViewType } from '.';
import type { StateInterface } from '../index';

const actions: ActionTree<LayoutStateInterface, StateInterface> = {
  leftDrawerDisplayed(context, show: boolean) {
    context.commit('SET_LEFT_DRAWER', show);
  },

  leftDrawerHovered(context, show: boolean) {
    context.commit('SET_LEFT_DRAWER_HOVERED', show);
  },

  rightDrawerDisplayed(context, show: boolean) {
    context.commit('SET_RIGHT_DRAWER', show);
  },

  changeRightDrawerContent(context, showing: ViewType) {
    context.commit('SET_CONTENT_RIGHT_DRAWER', showing);
  },

  pricelistPlanningDisplayed(context, show: boolean) {
    if (show) {
      context.commit('SHOW_PRICELIST_PLANNING');
    } else {
      context.commit('HIDE_PRICELIST_PLANNING');
    }
  },

  setPopUpOpened(context, payload: string) {
    context.commit('SET_POP_UP_OPENED', payload);
  },
  setRightDrawerSearchParam(context, payload: string) {
    context.commit('SET_RIGHT_DRAWER_SEARCH_PARAM', payload);
  },
  setRightDrawerFilter(context, payload: string) {
    context.commit('SET_RIGHT_DRAWER_FILTER', payload);
  },
  setForceMoveFolioTab(context, payload: string) {
    context.commit('SET_FORCE_MOVE_FOLIO_TAB', payload);
  },
  setMoveToGuestsTab(context, payload: boolean) {
    context.commit('SET_MOVE_TO_GUESTS_TAB', payload);
  },
  clearForceMoveFolioTab(context) {
    context.commit('CLEAR_FORCE_MOVE_FOLIO_TAB');
  },

  showSpinner(context, payload: boolean) {
    context.commit('SHOW_SPINNER', payload);
  },
};

export default actions;
