
const parseNumber = (val) => parseFloat(String(val || 0).replace(/,/g, '')) || 0;

export default function Totals({ products, discount, setDiscount }) {

    const subtotal = products.reduce((acc, product) => {
        const qty = parseNumber(product.quantity);
        const price = parseNumber(product.price);
        return acc + (qty * price);
    }, 0);

    const grandTotal = subtotal - parseNumber(discount);

    const handleDiscountChange = (e) => {
        let val = e.target.value.replace(/[^0-9.]/g, '');
        const parts = val.split('.');
        if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
        setDiscount(val);
    };

    const handleDiscountBlur = () => {
        if (!discount && discount !== 0) return;
        const num = parseNumber(discount);
        if (!isNaN(num)) {
            setDiscount(num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
        }
    };

    const handleDiscountFocus = () => {
        if (typeof discount === 'string') {
            setDiscount(discount.replace(/,/g, ''));
        }
    };

    return (
        <div className="flex justify-end mt-12 w-full pr-4 sm:pr-0">
            <div className="w-full sm:w-80 flex flex-col gap-3">
                {/* Discount Input */}
                <div className="flex justify-between items-center text-gray-500 font-medium px-4">
                    <span>Discount (₹)</span>
                    <input
                        type="text"
                        inputMode="decimal"
                        className="w-28 bg-transparent border-b border-gray-300 focus:border-blue-500 p-1 text-right focus:outline-none text-gray-800"
                        placeholder="0.00"
                        value={discount === 0 ? '' : discount}
                        onChange={handleDiscountChange}
                        onBlur={handleDiscountBlur}
                        onFocus={handleDiscountFocus}
                    />
                </div>

                {/* Grand Total Box */}
                <div className="bg-blue-500 text-white rounded-xl p-4 flex justify-between items-center print:bg-white print:text-gray-900 print:shadow-none print:border-t-2 print:border-gray-900 print:p-2 print:rounded-none">
                    <span className="font-bold tracking-wider uppercase">TOTAL</span>
                    <span className="text-2xl font-black">₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
            </div>
        </div>
    );
}
