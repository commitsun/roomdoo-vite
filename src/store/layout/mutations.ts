import type { MutationTree } from 'vuex';
import type { LayoutStateInterface, ViewType } from '.';

const mutation: MutationTree<LayoutStateInterface> = {
  SET_LEFT_DRAWER(state: LayoutStateInterface, show: boolean) {
    state.leftDrawerExpanded = show;
  },
  SET_RIGHT_DRAWER(state: LayoutStateInterface, show: boolean) {
    state.rightDrawerExpanded = show;
  },
  SET_LEFT_DRAWER_HOVERED(state: LayoutStateInterface, show: boolean) {
    state.leftDrawerHovered = show;
  },
  SET_CONTENT_RIGHT_DRAWER(state: LayoutStateInterface, showing: ViewType) {
    state.showing = showing;
  },
  SHOW_PRICELIST_PLANNING(state: LayoutStateInterface) {
    state.pricelistPlanningExpanded = true;
  },
  HIDE_PRICELIST_PLANNING(state: LayoutStateInterface) {
    state.pricelistPlanningExpanded = false;
  },
  SET_POP_UP_OPENED(state: LayoutStateInterface, payload: string) {
    state.popUpOpen = payload;
  },
  SET_RIGHT_DRAWER_SEARCH_PARAM(state: LayoutStateInterface, payload: string) {
    state.rightDrawerSearchParam = payload;
  },
  SET_RIGHT_DRAWER_FILTER(state: LayoutStateInterface, payload: string) {
    state.rightDrawerFilter = payload;
  },
  SET_FORCE_MOVE_FOLIO_TAB(state: LayoutStateInterface, payload: string) {
    state.forceMoveFolioTab = payload;
  },
  SET_MOVE_TO_GUESTS_TAB(state: LayoutStateInterface, payload: boolean) {
    state.isMoveToGuestsTab = payload;
  },
  CLEAR_FORCE_MOVE_FOLIO_TAB(state: LayoutStateInterface) {
    state.forceMoveFolioTab = '';
  },
  SHOW_SPINNER(state: LayoutStateInterface, payload: boolean) {
    state.showSpinner = payload;
  },
};

export default mutation;
