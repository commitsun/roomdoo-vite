import type { TransactionsStateInterface } from '.'

function state(): TransactionsStateInterface {
  return {
    transactions: [],
    total: 0,
    totalTransactions: 0,
    currentTransaction: null,
  }
}

export default state
