import ProductRow from './ProductRow';
import { PlusCircle } from 'lucide-react';

export default function ProductList({ products, setProducts }) {

    const addProduct = () => {
        setProducts([...products, { id: Date.now(), name: '', quantity: 1, price: 0 }]);
    };

    const updateProduct = (id, field, value) => {
        setProducts(products.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    const removeProduct = (id) => {
        // Ensure there is always at least one row
        if (products.length > 1) {
            setProducts(products.filter(p => p.id !== id));
        } else {
            setProducts([{ id: Date.now(), name: '', quantity: 1, price: 0 }]);
        }
    };

    return (
        <div className="w-full">
            {/* Header Row */}
            <div className="hidden sm:flex items-center gap-4 pb-2 border-b-2 border-gray-900 mb-4 px-2">
                <div className="flex-grow font-bold text-xs tracking-wider uppercase text-gray-900">Product</div>
                <div className="w-20 text-center font-bold text-xs tracking-wider uppercase text-gray-900">Qty</div>
                <div className="w-28 text-right font-bold text-xs tracking-wider uppercase text-gray-900 pr-2">Price</div>
                <div className="w-28 text-right font-bold text-xs tracking-wider uppercase text-gray-900 pr-2">Total</div>
                <div className="w-8 no-print"></div> {/* Spacer for delete icon */}
            </div>

            {/* Rows */}
            <div className="flex flex-col gap-1">
                {products.map((product, index) => (
                    <ProductRow
                        key={product.id}
                        product={product}
                        index={index}
                        updateProduct={updateProduct}
                        removeProduct={removeProduct}
                        onEnterPress={addProduct}
                        isLast={index === products.length - 1}
                    />
                ))}
            </div>

            {/* Add Item Button (hidden in print) */}
            <div className="mt-4 no-print">
                <button
                    onClick={addProduct}
                    className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors px-2 py-1 rounded"
                >
                    <PlusCircle size={16} />
                    <span>Add New Item</span>
                </button>
            </div>
        </div>
    );
}
