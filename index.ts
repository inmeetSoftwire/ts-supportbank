import { readFileSync } from "fs";
import { parse } from "csv-parse/sync"
import {parse as parseDate, format} from "date-fns"
import { question } from "readline-sync"
import { Transaction } from "./lib/transaction.js";


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
    const data = readFileSync(filePath, "utf8");
    const records: TransactionRow[] = parse(data, {columns: true, skip_empty_lines: true});
    const transactions: Transaction[] = [];
    for (const row of records) {
        const date: Date = parseDate(row.Date, "dd/MM/yyyy", new Date())
        const narrative: string = row.Narrative;
        const from: string = row.From;
        const to: string = row.To;
        const amount: number = parseFloat(row.Amount);

        const transaction: Transaction = {date, narrative, from, to, amount};
        transactions.push(transaction);
    }
    return transactions;
}


function computeAccountBalances(transactions: Transaction[]) {
    const accounts = new Map<string, Account>();
    for (const transaction of transactions) {
        const from: string = transaction.from
        const to: string = transaction.to
        if (!accounts.has(from)) accounts.set(from, new Account(from));
        if (!accounts.has(to)) accounts.set(to, new Account(to));

        accounts.get(from)!.applyTransaction(transaction, true);
        accounts.get(to)!.applyTransaction(transaction, false);
    }
    return accounts
}
function displayAccountBalances(accounts: Map<string, Account>): void {
    console.log("\n=== Account Balances ===");
    for (const account of accounts.values()) {
        console.log(`${account.name}: £${account.balance.toFixed(2)}`);
    }
}

function displayTransactionsOfAccount(transactions: Transaction[], accountName: string) {
    console.log(`\n=== Transactions of ${accountName} ===`);
    for (const transaction of transactions) {
        if (transaction.from == accountName || transaction.to == accountName) {
            console.log(`${format(transaction.date,"EEE MMM dd yyyy")} | From: ${transaction.from} | To: ${transaction.to} | ${transaction.narrative} | £${transaction.amount.toFixed(2)}`)
        }
    }
}

function main(): void {
    const transactions: Transaction[] = loadTransactions('Transactions2014.csv')
    let accounts: Map<string, Account> = new Map();
    while (true) {
        const command: string = question('Enter your command ("list all", "list [account]" or "exit"): ');
        if (command.toLowerCase() == "list all") {
            if (accounts.size == 0) {
                accounts = computeAccountBalances(transactions);
            }
            displayAccountBalances(accounts);
        } else if (command.toLowerCase().startsWith("list ")) {
            const accountName: string = command.slice(5, command.length);
            displayTransactionsOfAccount(transactions, accountName);
        } else if (command.toLowerCase() == "exit") {
            break;
        }
    }
}

main()