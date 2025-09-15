import { parse } from "csv-parse/sync"
import { TransactionCsvData } from "./transactionCsvData.js";

export function parseCsv(data: string) : TransactionCsvData[] {
    return parse(data, {columns: true, skip_empty_lines: true}) as TransactionCsvData[];
}