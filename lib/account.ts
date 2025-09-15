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
    
    applyTransactionToBalance(transaction: Transaction): void {
        if (transaction.from === this.name) {
            this.balance -= transaction.amount;
        } else if (transaction.to === this.name) {
            this.balance += transaction.amount;
        }
    }

    addTransactionToHistory(transaction: Transaction): void {
        this.transactions.push(transaction);
    }
}
