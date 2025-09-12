import { Transaction } from "./transaction.js";

export class Account {
    name: string;
    balance: number;
    transactions: Transaction[];

    constructor(name: string) {
        this.name = name;
        this.balance = 0;
        this.transactions = [];
    }

    applyTransaction(transaction: Transaction, isSender: boolean): void {
        if (isSender) {
            this.balance -= transaction.amount;
        } else {
            this.balance += transaction.amount;
        }
        this.transactions.push(transaction);
    }
}
