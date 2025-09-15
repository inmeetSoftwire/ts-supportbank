import {parse, format} from "date-fns"

export function parseDate(dateString: string) {
    return parse(dateString, "dd/MM/yyyy", new Date());
}

export function formatDate(date: Date) {
    // Format the given date as a string like "Mon Jan 15 2025" (day, month, date, year)
    return format(date,"EEE MMM dd yyyy");
}