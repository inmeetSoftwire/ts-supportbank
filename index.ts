import { readFileSync } from "fs";
import { parse } from "csv-parse/sync"
import { question } from "readline-sync"
import { Transaction } from "./lib/transaction.js";
import { Account } from "./lib/account.js";
import { TransactionCsvData } from "./lib/TransactionRow.js";
import { parseDate, formatDate } from "./lib/dateHelper.js";

function loadTransactions(filePath: string) {
    const data = readFileSync(filePath, "utf8");
    const records: TransactionCsvData[] = parse(data, {columns: true, skip_empty_lines: true});
    const transactions: Transaction[] = [];
    for (const row of records) {
        const date: Date = parseDate(row.Date);
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

        accounts.get(from)!.applyTransactionToBalance(transaction);
        accounts.get(from)!.addTransactionToHistory(transaction);

        accounts.get(to)!.applyTransactionToBalance(transaction);
        accounts.get(to)!.addTransactionToHistory(transaction);
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
            console.log(`${formatDate(transaction.date)} | From: ${transaction.from} | To: ${transaction.to} | ${transaction.narrative} | £${transaction.amount.toFixed(2)}`)
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