/**
 * Test Suite: RST - Reset & Clear Data
 * Covers test cases RST-01 and RST-02
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Invoice from '../components/Invoice';

// Mock all external utilities used by Invoice and its children
vi.mock('../utils/imageStorage', () => ({
    saveShopLogo: vi.fn(),
    getShopLogo: vi.fn().mockResolvedValue(null),
    deleteShopLogo: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../utils/generateInvoiceNumber', () => ({
    generateInvoiceNumber: vi.fn()
        .mockReturnValueOnce('INV-20260304-120000')
        .mockReturnValueOnce('INV-20260304-120001')
        .mockReturnValue('INV-20260304-120002'),
}));

vi.mock('date-fns', () => ({
    format: vi.fn(() => 'March 4, 2026'),
}));

vi.mock('html2canvas', () => ({
    default: vi.fn(),
}));

vi.mock('jspdf', () => ({
    default: vi.fn(),
}));

describe('RST - Reset & Clear Data', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        // Pre-populate localStorage with some shop details
        localStorage.setItem('shopName', JSON.stringify('Test Shop'));
        localStorage.setItem('shopAddress', JSON.stringify('123 Main St'));
        localStorage.setItem('mobileNumber', JSON.stringify('+91 98765 43210'));

        window.confirm = vi.fn(() => true);
        window.alert = vi.fn();
        Object.defineProperty(window, 'location', {
            writable: true,
            value: { reload: vi.fn() },
        });
    });

    // RST-01: Reset Invoice
    it('RST-01: should clear products to 1 empty row and regenerate invoice ID when Reset is clicked', async () => {
        const user = userEvent.setup();
        render(<Invoice />);

        // Add a couple of products first
        const addButton = screen.getByText(/add new item/i);
        await user.click(addButton);
        await user.click(addButton);

        // Confirm 3 rows exist now
        const nameInputsBefore = screen.getAllByPlaceholderText(/enter product name/i);
        expect(nameInputsBefore.length).toBe(3);

        // Click Reset
        const resetButton = screen.getByRole('button', { name: /reset/i });
        await user.click(resetButton);

        // After reset, should be back to 1 empty row
        const nameInputsAfter = screen.getAllByPlaceholderText(/enter product name/i);
        expect(nameInputsAfter.length).toBe(1);
        expect(nameInputsAfter[0].value).toBe('');
    });

    // RST-01 (continued): Invoice number regenerates after reset
    it('RST-01b: should generate a new invoice number after reset', async () => {
        const { generateInvoiceNumber } = await import('../utils/generateInvoiceNumber');
        const user = userEvent.setup();
        render(<Invoice />);

        // generateInvoiceNumber is called once on mount
        const callsBefore = generateInvoiceNumber.mock.calls.length;

        const resetButton = screen.getByRole('button', { name: /reset/i });
        await user.click(resetButton);

        // Should have been called one more time on reset
        expect(generateInvoiceNumber.mock.calls.length).toBeGreaterThan(callsBefore);
    });

    // RST-01 (continued): Shop name/address/logo are NOT cleared on reset
    it('RST-01c: should preserve shop name, address, and logo after Reset', async () => {
        const user = userEvent.setup();
        render(<Invoice />);

        const resetButton = screen.getByRole('button', { name: /reset/i });
        await user.click(resetButton);

        // Shop details remain in localStorage
        expect(JSON.parse(localStorage.getItem('shopName'))).toBe('Test Shop');
        expect(JSON.parse(localStorage.getItem('shopAddress'))).toBe('123 Main St');
    });

    // RST-02: Clear All Data
    it('RST-02: should wipe localStorage and call deleteShopLogo then reload when "Clear All Data" is clicked', async () => {
        const { deleteShopLogo } = await import('../utils/imageStorage');
        const user = userEvent.setup();
        render(<Invoice />);

        // "Clear All Data" link in the footer
        const clearButton = screen.getByRole('button', { name: /clear all data/i });
        await user.click(clearButton);

        await waitFor(() => {
            expect(window.confirm).toHaveBeenCalled();
            expect(deleteShopLogo).toHaveBeenCalled();
            expect(window.location.reload).toHaveBeenCalled();
        });

        // localStorage should be empty
        expect(localStorage.length).toBe(0);
    });
});

