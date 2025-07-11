import { type CashRegisterStateInterface } from '.';

function state(): CashRegisterStateInterface {
  return {
    cashRegister: null,
    cashRegisterResult: null,
  };
}

export default state;
