import { format, parseISO, isValid } from 'date-fns';

/**
 * Formats a date string to 'dd-mm-yyyy' for display.
 * @param dateStr ISO date string or YYYY-MM-DD string
 * @returns Formatted date string or original string if invalid
 */
export const formatDate = (dateStr?: string | null): string => {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        if (!isValid(date)) return dateStr;
        return format(date, 'dd-MM-yyyy');
    } catch (error) {
        return dateStr;
    }
};

/**
 * Formats a date string to 'YYYY-MM-DD' for input fields (type="date").
 */
export const formatForInput = (dateStr?: string | null): string => {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        if (!isValid(date)) return '';
        return format(date, 'yyyy-MM-dd');
    } catch (error) {
        return '';
    }
};
