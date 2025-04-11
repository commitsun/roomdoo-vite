import type { LayoutStateInterface } from '.';

function state(): LayoutStateInterface {
  return {
    leftDrawerExpanded: false,
    rightDrawerExpanded: false,
    leftDrawerHovered: false,
    showing: 'FolioList',
    pricelistPlanningExpanded: false,
    popUpOpen: '',
    rightDrawerSearchParam: '',
    rightDrawerFilter: '',
    forceMoveFolioTab: '',
    showSpinner: false,
    isMoveToGuestsTab: false,
  };
}

export default state;
