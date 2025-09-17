import type { Module } from 'vuex';
import type { StateInterface } from '@/_legacy/store/index';
import state from './state';
import actions from './actions';
import type { Link } from '@/_legacy/interfaces/LinkInterface';

export interface LinksStateInterface {
  links: Link[];
}

const linksModule: Module<LinksStateInterface, StateInterface> = {
  namespaced: true,
  actions,
  state,
};

export default linksModule;
