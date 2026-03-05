import { useState, useRef, useEffect } from 'react';
import InvoiceHeader from './InvoiceHeader';
import ProductList from './ProductList';
import Totals from './Totals';
import Signature from './Signature';
import { generateInvoiceNumber } from '../utils/generateInvoiceNumber';
import { deleteShopLogo } from '../utils/imageStorage';
import { RefreshCcw, Printer, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function Invoice() {
    // Using regular state for products so they reset on refresh
    const [products, setProducts] = useState([
        { id: 1, name: '', quantity: 1, price: 0 }
    ]);
    const [discount, setDiscount] = useState(0);
    const [invoiceNumber, setInvoiceNumber] = useState('');

    const invoiceRef = useRef(null);

    useEffect(() => {
        // Generate invoice number only once per load so it stays consistent
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setInvoiceNumber(generateInvoiceNumber());
    }, []);

    const handlePrint = () => {
        const hasProducts = products.some(p => p.name.trim() !== '' || p.price > 0 || p.quantity > 0);
        if (!hasProducts) {
            alert("Add items first to your invoice before printing.");
            return;
        }
        window.print();
    };

    const handleDownloadPDF = async () => {
        if (!invoiceRef.current) return;

        const hasProducts = products.some(p => p.name.trim() !== '' || p.price > 0 || p.quantity > 0);
        if (!hasProducts) {
            alert("Add items first to your invoice before downloading.");
            return;
        }

        const element = invoiceRef.current;

        // Slight delay to ensure any UI states (like focus rings) clear up
        setTimeout(async () => {
            try {
                const canvas = await html2canvas(element, {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff'
                });

                // Optimization: Use JPEG instead of PNG and set quality for smaller file size
                const imgData = canvas.toDataURL('image/jpeg', 0.85);

                // standard A4 size in mm
                const a4Width = 210;
                const margin = 12; // 12mm margin from all sides

                // calculate inner dimensions inside margins
                const innerWidth = a4Width - (margin * 2);

                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4',
                    compress: true // Enable jsPDF compression
                });

                // Calculate the final image height based on the available width
                const pdfImgHeight = (canvas.height * innerWidth) / canvas.width;

                // Add image with margin offsets
                pdf.addImage(imgData, 'JPEG', margin, margin, innerWidth, pdfImgHeight, undefined, 'FAST');

                // Save the PDF with exact invoice name
                pdf.save(`${invoiceNumber}.pdf`);
            } catch (err) {
                console.error("Could not generate PDF", err);
                alert("Failed to generate PDF. Please try again.");
            }
        }, 500);
    };

    const handleReset = () => {
        setProducts([{ id: Date.now(), name: '', quantity: 1, price: 0 }]);
        setDiscount(0);
        setInvoiceNumber(generateInvoiceNumber());
    };

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">

            {/* Top Action Bar - Hidden in print */}
            <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col sm:flex-row justify-between items-center gap-4 no-print border border-gray-100">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <img src="/icon.svg" alt="Logo" className="w-10 h-10 rounded-xl shadow-md" />
                    <h2 className="text-xl font-bold font-sans text-gray-800 tracking-tight">Instant Invoice</h2>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                        onClick={handleReset}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                    >
                        <RefreshCcw size={16} />
                        <span>Reset</span>
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-200 hover:border-gray-300 rounded-xl shadow-sm transition-colors"
                    >
                        <Printer size={16} />
                        <span>Print</span>
                    </button>
                    <button
                        onClick={handleDownloadPDF}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 transition-all border border-blue-500"
                    >
                        <Download size={16} />
                        <span>Download PDF</span>
                    </button>
                </div>
            </div>

            <div
                ref={invoiceRef}
                className="bg-white sm:rounded-3xl sm:border border-gray-100 p-8 sm:p-12 print-container bg-white w-full mx-auto"
                style={{ minHeight: '1056px' }} // Approximate A4 aspect ratio height
            >
                <InvoiceHeader invoiceNumber={invoiceNumber} />

                {/* Divider */}
                <div className="w-full h-px bg-gray-100 my-10" />

                {/* Products and Totals */}
                <div className="min-h-[400px] flex flex-col justify-between">
                    <div>
                        <ProductList products={products} setProducts={setProducts} />
                    </div>
                    <div>
                        <Totals products={products} discount={discount} setDiscount={setDiscount} />
                        <Signature />
                    </div>
                </div>

            </div>

            {/* Footer Info - Hidden in print */}
            <div className="text-center text-xs text-gray-400 pb-8 no-print flex items-center justify-between px-4">
                <p>Auto-saves shop details to your browser.</p>
                <div className="flex gap-4 font-semibold uppercase tracking-wider text-[10px]">
                    <button onClick={async () => {
                        if (confirm('Clear all saved shop details?')) {
                            localStorage.clear();
                            await deleteShopLogo();
                            window.location.reload();
                        }
                    }} className="hover:text-gray-800 transition-colors">Clear All Data</button>
                </div>
            </div>
        </div>
    );
}
