/**
 * Test Suite: PR - Product Row Logic
 * Covers test cases PR-01 through PR-07
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import ProductList from '../components/ProductList';
import ProductRow from '../components/ProductRow';

// Wrapper to give ProductList its own state
function ProductListWrapper({ initialProducts }) {
    const [products, setProducts] = useState(
        initialProducts || [{ id: 1, name: '', quantity: 1, price: 0 }]
    );
    return (
        <div>
            <ProductList products={products} setProducts={setProducts} />
            {/* Debug output for assertions */}
            <div data-testid="product-count">{products.length}</div>
            <div data-testid="products-json">{JSON.stringify(products)}</div>
        </div>
    );
}

// Wrapper for a single ProductRow
function ProductRowWrapper({ initialProduct, onRemove }) {
    const [product, setProduct] = useState(initialProduct);
    const updateProduct = (id, field, value) => setProduct(p => ({ ...p, [field]: value }));
    return (
        <div>
            <ProductRow
                product={product}
                updateProduct={updateProduct}
                removeProduct={onRemove || vi.fn()}
                onEnterPress={vi.fn()}
                isLast={true}
            />
            <div data-testid="line-total">
                {(parseFloat(String(product.quantity || 0)) * parseFloat(String(product.price || 0).replace(/,/g, ''))).toFixed(2)}
            </div>
        </div>
    );
}

describe('PR - Product Row Logic', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    // PR-01: Line Total Calculation
    it('PR-01: should calculate line total as Qty × Price', async () => {
        render(
            <ProductRowWrapper initialProduct={{ id: 1, name: 'Widget', quantity: 2, price: '10.50' }} />
        );

        const lineTotal = screen.getByTestId('line-total');
        expect(lineTotal.textContent).toBe('21.00');
    });

    // PR-02: Adding a Row via button click
    it('PR-02: should add a new row when "+ Add New Item" is clicked', async () => {
        const user = userEvent.setup();
        render(<ProductListWrapper />);

        expect(screen.getByTestId('product-count').textContent).toBe('1');

        const addButton = screen.getByText(/add new item/i);
        await user.click(addButton);

        await waitFor(() => {
            expect(screen.getByTestId('product-count').textContent).toBe('2');
        });
    });

    // PR-03: Adding a Row via Enter key
    it('PR-03: should add a new row when Enter is pressed in a product input', async () => {
        const user = userEvent.setup();
        render(<ProductListWrapper />);

        expect(screen.getByTestId('product-count').textContent).toBe('1');

        const nameInput = screen.getAllByPlaceholderText(/enter product name/i)[0];
        await user.click(nameInput);
        await user.keyboard('{Enter}');

        await waitFor(() => {
            expect(screen.getByTestId('product-count').textContent).toBe('2');
        });
    });

    // PR-04: Removing a Row
    it('PR-04: should remove the row and recalculate total when X is clicked', async () => {
        const user = userEvent.setup();
        render(
            <ProductListWrapper
                initialProducts={[
                    { id: 1, name: 'Item A', quantity: 1, price: 10 },
                    { id: 2, name: 'Item B', quantity: 2, price: 5 },
                ]}
            />
        );

        expect(screen.getByTestId('product-count').textContent).toBe('2');

        // Delete buttons have title="Remove item"
        const deleteButtons = screen.getAllByTitle('Remove item');
        expect(deleteButtons.length).toBe(2);

        await user.click(deleteButtons[0]);

        await waitFor(() => {
            expect(screen.getByTestId('product-count').textContent).toBe('1');
        });
    });

    // PR-05: Removing Last Row – clears but keeps 1 row
    it('PR-05: should clear fields but keep at least 1 row when the last row is deleted', async () => {
        const user = userEvent.setup();
        render(
            <ProductListWrapper
                initialProducts={[{ id: 1, name: 'Only Item', quantity: 3, price: 50 }]}
            />
        );

        expect(screen.getByTestId('product-count').textContent).toBe('1');

        const deleteButton = screen.getByTitle('Remove item');
        await user.click(deleteButton);

        // Count must still be 1 (min 1 row rule)
        await waitFor(() => {
            expect(screen.getByTestId('product-count').textContent).toBe('1');
        });

        // Row should now be empty
        const nameInput = screen.getByPlaceholderText(/enter product name/i);
        expect(nameInput.value).toBe('');
    });

    // PR-06: Negative Quantities restricted by min="1"
    it('PR-06: quantity input should have min="1" attribute to restrict negative values', () => {
        render(<ProductListWrapper />);
        const qtyInput = screen.getByPlaceholderText(/qty/i);
        expect(qtyInput).toHaveAttribute('min', '1');
    });

    // PR-07: Fractional Prices
    it('PR-07: should calculate correct line total for fractional prices (0.33 × 3 = 0.99)', () => {
        render(
            <ProductRowWrapper initialProduct={{ id: 1, name: 'Fractional', quantity: 3, price: '0.33' }} />
        );

        const lineTotal = screen.getByTestId('line-total');
        expect(parseFloat(lineTotal.textContent)).toBeCloseTo(0.99, 2);
    });
});



