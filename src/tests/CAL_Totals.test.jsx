/**
 * Test Suite: CAL - Totals and Calculations
 * Covers test cases CAL-01 through CAL-05
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useState } from 'react';
import Totals from '../components/Totals';

// Helper: renders Totals with controllable discount state
function TotalsWrapper({ products, initialDiscount = 0 }) {
    const [discount, setDiscount] = useState(initialDiscount);
    return (
        <div>
            <Totals products={products} discount={discount} setDiscount={setDiscount} />
        </div>
    );
}

// Products summing to ₹65  (10 + 20 + 35)
const baseProducts = [
    { id: 1, name: 'A', quantity: 1, price: 10 },
    { id: 2, name: 'B', quantity: 2, price: 10 },  // 2×10 = 20
    { id: 3, name: 'C', quantity: 1, price: 35 },
];

describe('CAL - Totals and Calculations', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    // CAL-01: Subtotal Summation
    it('CAL-01: should display ₹65.00 grand total when no discount is set', () => {
        render(<TotalsWrapper products={baseProducts} initialDiscount={0} />);
        // Grand total should equal subtotal when discount is 0
        expect(screen.getByText(/₹65\.00/)).toBeInTheDocument();
    });

    // CAL-02: Valid Discount
    it('CAL-02: should show ₹55.00 when discount is 10', async () => {
        render(<TotalsWrapper products={baseProducts} initialDiscount={0} />);

        const discountInput = screen.getByPlaceholderText('0.00');
        fireEvent.change(discountInput, { target: { value: '10' } });
        fireEvent.blur(discountInput);

        await waitFor(() => {
            expect(screen.getByText(/₹55\.00/)).toBeInTheDocument();
        });
    });

    // CAL-03: Decimal Discount
    it('CAL-03: should show ₹59.50 when discount is 5.50', async () => {
        render(<TotalsWrapper products={baseProducts} initialDiscount={0} />);

        const discountInput = screen.getByPlaceholderText('0.00');
        fireEvent.change(discountInput, { target: { value: '5.50' } });
        fireEvent.blur(discountInput);

        await waitFor(() => {
            expect(screen.getByText(/₹59\.50/)).toBeInTheDocument();
        });
    });

    // CAL-04: Blank Discount
    it('CAL-04: should show ₹65.00 when discount is cleared', async () => {
        render(<TotalsWrapper products={baseProducts} initialDiscount={10} />);

        const discountInput = screen.getByPlaceholderText('0.00');
        fireEvent.change(discountInput, { target: { value: '' } });
        fireEvent.blur(discountInput);

        await waitFor(() => {
            expect(screen.getByText(/₹65\.00/)).toBeInTheDocument();
        });
    });

    // CAL-05: Outsized Discount (> Subtotal → negative total)
    it('CAL-05: should show negative ₹-35.00 when discount (100) exceeds subtotal (65)', async () => {
        render(<TotalsWrapper products={baseProducts} initialDiscount={0} />);

        const discountInput = screen.getByPlaceholderText('0.00');
        fireEvent.change(discountInput, { target: { value: '100' } });
        fireEvent.blur(discountInput);

        await waitFor(() => {
            // Grand total = 65 - 100 = -35, rendered as ₹-35.00
            const totalEl = screen.getByText(/₹-35\.00|₹.*-35/);
            expect(totalEl).toBeInTheDocument();
        });
    });
});

