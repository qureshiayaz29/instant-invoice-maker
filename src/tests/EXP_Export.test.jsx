/**
 * Test Suite: EXP - Export Functionality (PDF & Print)
 * Covers test cases EXP-01 through EXP-05
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Invoice from '../components/Invoice';

// ── Hoisted mocks ─────────────────────────────────────────────────────────────
const { mockSave, mockAddImage, mockCanvas } = vi.hoisted(() => {
    const mockSave = vi.fn();
    const mockAddImage = vi.fn();
    const mockCanvas = {
        width: 800,
        height: 1131,
        toDataURL: vi.fn(() => 'data:image/jpeg;base64,MOCK'),
    };
    return { mockSave, mockAddImage, mockCanvas };
});

// jsPDF must be mocked as a real constructor function (not an arrow function)
vi.mock('jspdf', () => ({
    default: vi.fn(function () {
        this.addImage = mockAddImage;
        this.save = mockSave;
    }),
}));

vi.mock('html2canvas', () => ({
    default: vi.fn().mockResolvedValue(mockCanvas),
}));

vi.mock('../utils/imageStorage', () => ({
    saveShopLogo: vi.fn(),
    getShopLogo: vi.fn().mockResolvedValue(null),
    deleteShopLogo: vi.fn(),
}));

vi.mock('../utils/generateInvoiceNumber', () => ({
    generateInvoiceNumber: vi.fn().mockReturnValue('INV-20260304-120000'),
}));

vi.mock('date-fns', () => ({
    format: vi.fn(() => 'March 4, 2026'),
}));

// ── Helper: synchronously fill one product row ────────────────────────────────
function fillOneProduct() {
    fireEvent.change(
        screen.getAllByPlaceholderText(/enter product name/i)[0],
        { target: { value: 'Widget' } }
    );
    fireEvent.change(
        screen.getByPlaceholderText(/qty/i),
        { target: { value: '2' } }
    );
    // The first "0.00" placeholder is the product price field
    fireEvent.change(
        screen.getAllByPlaceholderText('0.00')[0],
        { target: { value: '50' } }
    );
}

describe('EXP - Export Functionality (PDF & Print)', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        // Spy on window.alert before each test (real timers for alert tests)
        vi.spyOn(window, 'alert').mockImplementation(() => {});
        vi.spyOn(window, 'print').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    // EXP-01: PDF Generation – filename matches invoice number
    it('EXP-01: should trigger PDF download with invoice number as filename', async () => {
        const html2canvas = (await import('html2canvas')).default;

        render(<Invoice />);
        fillOneProduct();

        const pdfButton = screen.getByRole('button', { name: /download pdf/i });

        // Use fake timers only to skip the 500ms setTimeout
        vi.useFakeTimers({ shouldAdvanceTime: true });
        fireEvent.click(pdfButton);
        await act(async () => { vi.advanceTimersByTime(600); });
        vi.useRealTimers();

        await waitFor(() => expect(html2canvas).toHaveBeenCalled(), { timeout: 3000 });
        await waitFor(() => expect(mockSave).toHaveBeenCalledWith('INV-20260304-120000.pdf'), { timeout: 3000 });
    }, 15000);

    // EXP-02: PDF uses A4 portrait with 12mm margins
    it('EXP-02: should use portrait A4 format and 12mm margins in the PDF', async () => {
        const jsPDF = (await import('jspdf')).default;

        render(<Invoice />);
        fillOneProduct();

        vi.useFakeTimers({ shouldAdvanceTime: true });
        fireEvent.click(screen.getByRole('button', { name: /download pdf/i }));
        await act(async () => { vi.advanceTimersByTime(600); });
        vi.useRealTimers();

        await waitFor(() => {
            expect(jsPDF).toHaveBeenCalledWith(
                expect.objectContaining({ orientation: 'portrait', unit: 'mm', format: 'a4' })
            );
        }, { timeout: 3000 });

        await waitFor(() => {
            expect(mockAddImage).toHaveBeenCalledWith(
                expect.any(String), 'JPEG',
                12, 12,
                expect.any(Number), expect.any(Number),
                undefined, 'FAST'
            );
        }, { timeout: 3000 });
    }, 15000);

    // EXP-03/04: Print calls window.print; action bar has no-print class
    it('EXP-03/04: should call window.print and action bar should carry no-print class', async () => {
        render(<Invoice />);
        fillOneProduct();

        fireEvent.click(screen.getByRole('button', { name: /print/i }));

        expect(window.print).toHaveBeenCalled();
        expect(document.querySelector('.no-print')).toBeInTheDocument();
    });

    // EXP-04: Alert shown when Print clicked with no meaningful products
    // (name='', price=0, quantity=0 — all fields truly empty)
    it('EXP-04: should show alert when Print is clicked with no products filled in', async () => {
        render(<Invoice />);

        // Default row has quantity=1 which passes the guard; set it to 0 to simulate truly empty
        fireEvent.change(screen.getByPlaceholderText(/qty/i), { target: { value: '0' } });

        fireEvent.click(screen.getByRole('button', { name: /print/i }));

        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Add items first'));
        expect(window.print).not.toHaveBeenCalled();
    });

    // EXP-05: PDF generation does not throw (OKLCH/OKLAB stability)
    it('EXP-05: should generate PDF without throwing errors', async () => {
        render(<Invoice />);
        fillOneProduct();

        vi.useFakeTimers({ shouldAdvanceTime: true });
        fireEvent.click(screen.getByRole('button', { name: /download pdf/i }));
        await act(async () => { vi.advanceTimersByTime(600); });
        vi.useRealTimers();

        await waitFor(() => expect(mockSave).toHaveBeenCalled(), { timeout: 3000 });
    }, 15000);
});


