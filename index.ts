import * as fs from "fs";
import { parse } from "csv-parse/sync"
import {parse as parseDate} from "date-fns"

class Transaction {
    date: Date;
    narrative: string;
    from: string;
    to: string;
    amount: number;

    constructor(date: Date, narrative: string, from: string, to: string, amount: number) {
        this.date = date;
        this.narrative = narrative;
        this.from = from;
        this.to = to;
        this.amount = amount;
    }
}

class Account {
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

interface TransactionRow {
    Date: string;
    From: string;
    To: string;
    Narrative: string;
    Amount: string;
}

function loadTransactions(filePath: string) {
    const data = fs.readFileSync(filePath, "utf8");
    const records: TransactionRow[] = parse(data, {columns: true, skip_empty_lines: true});
    const accounts = new Map<string, Account>();

    for (const row of records) {
        const date: Date = parseDate(row.Date, "dd/MM/yyyy", new Date())
        const narrative: string = row.Narrative;
        const from: string = row.From;
        const to: string = row.To;
        const amount: number = parseFloat(row.Amount);

        const transaction = new Transaction(date, narrative, from, to, amount);

        if (!accounts.has(from)) accounts.set(from, new Account(from));
        if (!accounts.has(to)) accounts.set(to, new Account(to));

        accounts.get(from)!.applyTransaction(transaction, true);
        accounts.get(to)!.applyTransaction(transaction, false);
    }
    return accounts;
}
