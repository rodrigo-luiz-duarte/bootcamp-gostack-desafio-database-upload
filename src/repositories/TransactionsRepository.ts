import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const defaultBalanceValue: Balance = {
      income: 0,
      outcome: 0,
      total: 0,
    };

    if (!transactions) {
      return defaultBalanceValue;
    }

    const balance = transactions.reduce(
      (accumulator: Balance, transaction: Transaction) => {
        switch (transaction.type) {
          case 'income':
            accumulator.income += +transaction.value;
            break;
          case 'outcome':
            accumulator.outcome += +transaction.value;
            break;
          default:
            break;
        }

        return accumulator;
      },
      defaultBalanceValue,
    );

    balance.total = balance.income - balance.outcome;

    return balance;
  }
}

export default TransactionsRepository;
