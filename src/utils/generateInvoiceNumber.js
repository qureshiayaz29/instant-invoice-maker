import { format } from 'date-fns';

/**
 * Generates a unique invoice number in the format INV-YYYYMMDD-HHMMSS
 * @returns {string} The generated invoice number
 */
export function generateInvoiceNumber() {
    const now = new Date();
    const dateStr = format(now, 'yyyyMMdd');
    const timeStr = format(now, 'HHmmss');
    return `INV-${dateStr}-${timeStr}`;
}
