import type { Module } from 'vuex';
import type { CountryInterface } from 'src/interfaces/CountryInterface';
import type { StateInterface } from '../index';
import state from './state';
import actions from './actions';
import mutations from './mutations';

export interface CountryStateInterface {
  countries: CountryInterface[];
}

const foliosModule: Module<CountryStateInterface, StateInterface> = {
  namespaced: true,
  actions,
  mutations,
  state,
};

export default foliosModule;
