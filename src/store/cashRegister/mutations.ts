import type { CashRegisterInterface } from 'src/interfaces/CashRegisterInterface';
import type { CashRegisterResultInterface } from 'src/interfaces/CashRegisterResultInterface';
import type { MutationTree } from 'vuex';
import type { CashRegisterStateInterface } from '.';

const mutation: MutationTree<CashRegisterStateInterface> = {
  SET_CASH_REGISTER(state: CashRegisterStateInterface, cashRegister: CashRegisterInterface) {
    if (cashRegister && cashRegister.dateTime !== null && cashRegister !== null) {
      cashRegister.dateTime = new Date(cashRegister.dateTime);
    }

    state.cashRegister = cashRegister;
  },
  SET_CASH_REGISTER_RESULT(
    state: CashRegisterStateInterface,
    cashRegisterResult: CashRegisterResultInterface
  ) {
    state.cashRegisterResult = cashRegisterResult;
  },
};

export default mutation;
