import type { Module } from 'vuex';
import type { CashRegisterInterface } from '@/interfaces/CashRegisterInterface';
import type { CashRegisterResultInterface } from '@/interfaces/CashRegisterResultInterface';
import type { StateInterface } from '../index';
import state from './state';
import actions from './actions';
import mutations from './mutations';

export interface CashRegisterStateInterface {
  cashRegister: CashRegisterInterface | null;
  cashRegisterResult: CashRegisterResultInterface | null;
}

const cashRegistersModule: Module<CashRegisterStateInterface, StateInterface> = {
  namespaced: true,
  actions,
  mutations,
  state,
};

export default cashRegistersModule;
