import { X } from 'lucide-react';

export default function ProductRow({ product, updateProduct, removeProduct, onEnterPress, isLast }) {
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            onEnterPress();
        }
    };

    const parseNumber = (val) => parseFloat(String(val || 0).replace(/,/g, '')) || 0;
    const lineTotal = parseNumber(product.quantity) * parseNumber(product.price);

    const handlePriceChange = (e) => {
        let val = e.target.value.replace(/[^0-9.]/g, '');
        const parts = val.split('.');
        if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
        updateProduct(product.id, 'price', val);
    };

    const handlePriceBlur = () => {
        if (!product.price) return;
        const num = parseNumber(product.price);
        if (!isNaN(num)) {
            updateProduct(product.id, 'price', num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
        }
    };

    const handlePriceFocus = () => {
        if (typeof product.price === 'string') {
            updateProduct(product.id, 'price', product.price.replace(/,/g, ''));
        }
    };

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 py-2 border-b border-gray-50 group hover:bg-gray-50 transition-colors -mx-4 px-4 sm:mx-0 sm:px-0">

            {/* Product Name */}
            <div className="flex-grow w-full sm:w-auto">
                <input
                    type="text"
                    className="w-full bg-transparent border-none p-2 focus:ring-1 focus:ring-blue-100 focus:outline-none placeholder-gray-300 rounded text-gray-800 font-medium"
                    placeholder="Enter product name.."
                    value={product.name}
                    onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus={isLast && product.name === ''} // auto-focus if newly added empty row
                />
            </div>

            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-end mt-2 sm:mt-0">
                {/* Quantity */}
                <div className="w-20">
                    <input
                        type="number"
                        min="1"
                        className="w-full bg-transparent border-none p-2 focus:ring-1 focus:ring-blue-100 focus:outline-none placeholder-gray-300 rounded text-center text-gray-800 font-medium"
                        placeholder="Qty"
                        value={product.quantity || ''}
                        onChange={(e) => updateProduct(product.id, 'quantity', parseFloat(e.target.value) || 0)}
                        onKeyDown={handleKeyDown}
                    />
                </div>

                {/* Price */}
                <div className="w-28 relative">
                    <span className="absolute left-2 top-2.5 text-gray-400 text-sm">₹</span>
                    <input
                        type="text"
                        inputMode="decimal"
                        className="w-full bg-transparent border-none p-2 pl-6 focus:ring-1 focus:ring-blue-100 focus:outline-none placeholder-gray-300 rounded text-right text-gray-800 font-medium"
                        placeholder="0.00"
                        value={product.price || ''}
                        onChange={handlePriceChange}
                        onBlur={handlePriceBlur}
                        onFocus={handlePriceFocus}
                        onKeyDown={handleKeyDown}
                    />
                </div>

                {/* Total (Read only) */}
                <div className="w-28 text-right font-bold text-gray-900 pr-2">
                    ₹{lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>

                {/* Delete button (hidden in print) */}
                <div className="w-8 flex justify-end no-print">
                    <button
                        onClick={() => removeProduct(product.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors p-1"
                        title="Remove item"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
