import type { Module } from 'vuex';
import type { CountryStatesInterface } from 'src/interfaces/CountryStatesInterface';
import type { StateInterface } from '../index';
import state from './state';
import actions from './actions';
import mutations from './mutations';

export interface CountryStatesStateInterface {
  countryStates: CountryStatesInterface[];
}

const foliosModule: Module<CountryStatesStateInterface, StateInterface> = {
  namespaced: true,
  actions,
  mutations,
  state,
};

export default foliosModule;
