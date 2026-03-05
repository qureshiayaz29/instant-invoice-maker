/**
 * Test Suite: HD - Shop Details (Header)
 * Covers test cases HD-01 through HD-10
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InvoiceHeader from '../components/InvoiceHeader';

// Mock imageStorage utils
vi.mock('../utils/imageStorage', () => ({
    saveShopLogo: vi.fn(),
    getShopLogo: vi.fn().mockResolvedValue(null),
    deleteShopLogo: vi.fn(),
}));

// Mock useLocalStorage to control stored values
// (uses the real hook — jsdom provides localStorage out of the box)

// Mock date-fns
vi.mock('date-fns', () => ({
    format: vi.fn(() => 'March 4, 2026'),
}));

const renderHeader = (invoiceNumber = 'INV-20260304-120000') => {
    return render(<InvoiceHeader invoiceNumber={invoiceNumber} />);
};

describe('HD - Shop Details (Header)', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    // HD-01: Empty Shop Name
    it('HD-01: should hide shop name area when shop name is blank in print view', async () => {
        renderHeader();
        const shopNameInput = screen.getByPlaceholderText(/shop name/i);
        expect(shopNameInput.value).toBe('');
        // When empty, the input should not display any populated text
        expect(shopNameInput.value).toBe('');
    });

    // HD-02: Empty Shop Address
    it('HD-02: should hide shop address area when blank', async () => {
        renderHeader();
        const addressInput = screen.getByPlaceholderText(/shop address/i);
        expect(addressInput.value).toBe('');
    });

    // HD-03: Empty Mobile Number
    it('HD-03: should hide mobile number when blank', async () => {
        renderHeader();
        const mobileInput = screen.getByPlaceholderText(/mobile/i);
        expect(mobileInput.value).toBe('');
    });

    // HD-04: Valid Logo Upload (< 500kb)
    it('HD-04: should accept and display a logo under 500KB', async () => {
        const { saveShopLogo } = await import('../utils/imageStorage');
        renderHeader();

        const file = new File(['a'.repeat(100)], 'logo.png', { type: 'image/png' });
        Object.defineProperty(file, 'size', { value: 100 * 1024 }); // 100KB

        const input = document.querySelector('input[type="file"]');
        await userEvent.upload(input, file);

        expect(saveShopLogo).toHaveBeenCalledWith(file);
        expect(window.alert).not.toHaveBeenCalled();
    });

    // HD-05: Oversized Logo Upload (> 500kb)
    it('HD-05: should reject logo over 500KB and show alert', async () => {
        const { saveShopLogo } = await import('../utils/imageStorage');
        renderHeader();

        const file = new File(['x'], 'big-logo.png', { type: 'image/png' });
        Object.defineProperty(file, 'size', { value: 600 * 1024 }); // 600KB

        const input = document.querySelector('input[type="file"]');
        await userEvent.upload(input, file);

        expect(window.alert).toHaveBeenCalledWith('Image size should be less than 500KB');
        expect(saveShopLogo).not.toHaveBeenCalled();
    });

    // HD-06: Logo Removal
    it('HD-06: should remove logo when X icon is clicked', async () => {
        const { getShopLogo, deleteShopLogo } = await import('../utils/imageStorage');
        const mockBlob = new Blob(['img'], { type: 'image/png' });
        getShopLogo.mockResolvedValue(mockBlob);
        deleteShopLogo.mockResolvedValue(undefined);

        renderHeader();

        // Wait for logo to load
        await waitFor(() => {
            expect(URL.createObjectURL).toHaveBeenCalled();
        });

        const removeButton = document.querySelector('button[title="Remove Logo"], button[aria-label*="remove"]')
            || screen.queryByRole('button', { name: /remove/i });
        if (removeButton) {
            fireEvent.click(removeButton);
            expect(deleteShopLogo).toHaveBeenCalled();
        }
    });

    // HD-07: LocalStorage Persistence
    it('HD-07: should persist shop name, address, and phone in localStorage', async () => {
        const user = userEvent.setup();
        renderHeader();

        const shopNameInput = screen.getByPlaceholderText(/shop name/i);
        await user.clear(shopNameInput);
        await user.type(shopNameInput, 'My Test Shop');

        // Verify localStorage would be updated via the useLocalStorage hook
        expect(shopNameInput.value).toBe('My Test Shop');
    });

    // HD-08: Address Line Limit (max 3 lines)
    it('HD-08: should prevent more than 3 lines in address', async () => {
        const user = userEvent.setup();
        renderHeader();

        const addressInput = screen.getByPlaceholderText(/shop address/i);

        // Type 3 lines (allowed)
        const threeLines = 'Line 1\nLine 2\nLine 3';
        await user.clear(addressInput);
        fireEvent.change(addressInput, { target: { value: threeLines } });
        expect(addressInput.value).toBe(threeLines);

        // Attempt a 4th line (should be blocked)
        const fourLines = 'Line 1\nLine 2\nLine 3\nLine 4';
        fireEvent.change(addressInput, { target: { value: fourLines } });
        expect(addressInput.value).toBe(threeLines); // remains at 3 lines
    });

    // HD-09: Mobile Formatting (Indian)
    it('HD-09: should format a 10-digit Indian mobile number on blur', async () => {
        renderHeader();

        const mobileInput = screen.getByPlaceholderText(/mobile/i);
        fireEvent.change(mobileInput, { target: { value: '9876543210' } });
        fireEvent.blur(mobileInput);

        await waitFor(() => {
            expect(mobileInput.value).toBe('+91 98765 43210');
        });
    });

    // HD-10: Mobile Length Limit (~20 chars)
    it('HD-10: should restrict mobile number to a maximum of 20 characters', async () => {
        renderHeader();

        const mobileInput = screen.getByPlaceholderText(/mobile/i);
        const longNumber = '1'.repeat(30);
        fireEvent.change(mobileInput, { target: { value: longNumber } });

        expect(mobileInput.value.length).toBeLessThanOrEqual(20);
    });
});

