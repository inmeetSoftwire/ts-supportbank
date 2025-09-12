import * as fs from "fs";
import { parse } from "csv-parse/sync";
import { parse as parseDate, format } from "date-fns";
import { question } from "readline-sync";
class Transaction {
    constructor(date, narrative, from, to, amount) {
        this.date = date;
        this.narrative = narrative;
        this.from = from;
        this.to = to;
        this.amount = amount;
    }
}
class Account {
    constructor(name) {
        this.name = name;
        this.balance = 0;
        this.transactions = [];
    }
    applyTransaction(transaction, isSender) {
        if (isSender) {
            this.balance -= transaction.amount;
        }
        else {
            this.balance += transaction.amount;
        }
        this.transactions.push(transaction);
    }
}
function loadTransactions(filePath) {
    const data = fs.readFileSync(filePath, "utf8");
    const records = parse(data, { columns: true, skip_empty_lines: true });
    const transactions = [];
    for (const row of records) {
        const date = parseDate(row.Date, "dd/MM/yyyy", new Date());
        const narrative = row.Narrative;
        const from = row.From;
        const to = row.To;
        const amount = parseFloat(row.Amount);
        const transaction = new Transaction(date, narrative, from, to, amount);
        transactions.push(transaction);
    }
    return transactions;
}
function computeAccountBalances(transactions) {
    const accounts = new Map();
    for (const transaction of transactions) {
        const from = transaction.from;
        const to = transaction.to;
        if (!accounts.has(from))
            accounts.set(from, new Account(from));
        if (!accounts.has(to))
            accounts.set(to, new Account(to));
        accounts.get(from).applyTransaction(transaction, true);
        accounts.get(to).applyTransaction(transaction, false);
    }
    return accounts;
}
function displayAccountBalances(accounts) {
    console.log("\n=== Account Balances ===");
    for (const account of accounts.values()) {
        console.log(`${account.name}: £${account.balance.toFixed(2)}`);
    }
}
function displayTransactionsOfAccount(transactions, accountName) {
    console.log(`\n=== Transactions of ${accountName} ===`);
    for (const transaction of transactions) {
        if (transaction.from == accountName || transaction.to == accountName) {
            console.log(`${format(transaction.date, "EEE MMM dd yyyy")} | From: ${transaction.from} | To: ${transaction.to} | ${transaction.narrative} | £${transaction.amount.toFixed(2)}`);
        }
    }
}
function main() {
    const transactions = loadTransactions('Transactions2014.csv');
    let accounts = new Map();
    while (true) {
        const command = question('Enter your command ("list all", "list [account]" or "exit"): ');
        if (command.toLowerCase() == "list all") {
            if (accounts.size == 0) {
                accounts = computeAccountBalances(transactions);
            }
            displayAccountBalances(accounts);
        }
        else if (command.toLowerCase().startsWith("list ")) {
            const accountName = command.slice(5, command.length);
            displayTransactionsOfAccount(transactions, accountName);
        }
        else if (command.toLowerCase() == "exit") {
            break;
        }
    }
}
main();
