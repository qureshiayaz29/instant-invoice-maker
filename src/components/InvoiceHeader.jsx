import { useState, useEffect, useRef } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { saveShopLogo, getShopLogo, deleteShopLogo } from '../utils/imageStorage';
import { format } from 'date-fns';
import { ImagePlus, X } from 'lucide-react';

export default function InvoiceHeader({ invoiceNumber }) {
    const [shopName, setShopName] = useLocalStorage('shopName', '');
    const [shopAddress, setShopAddress] = useLocalStorage('shopAddress', '');
    const [mobileNumber, setMobileNumber] = useLocalStorage('mobileNumber', '');

    const [logoUrl, setLogoUrl] = useState(null);
    const fileInputRef = useRef(null);

    const currentDate = format(new Date(), 'MMMM d, yyyy');

    // Load logo from IndexedDB on mount
    useEffect(() => {
        async function loadLogo() {
            const blob = await getShopLogo();
            if (blob) {
                setLogoUrl(URL.createObjectURL(blob));
            }
        }
        loadLogo();
    }, []);

    const handleLogoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 500 * 1024) {
            alert("Image size should be less than 500KB");
            return;
        }

        // Save natively to idb
        await saveShopLogo(file);

        // Revoke old url to prevent memory leak
        if (logoUrl) URL.revokeObjectURL(logoUrl);

        setLogoUrl(URL.createObjectURL(file));
    };

    const handleRemoveLogo = async (e) => {
        e.stopPropagation();
        await deleteShopLogo();
        if (logoUrl) URL.revokeObjectURL(logoUrl);
        setLogoUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const clickFileUpload = () => {
        // Only click upload if there is no logo, or if they click the area
        fileInputRef.current?.click();
    };

    const handleMobileChange = (e) => {
        let val = e.target.value.replace(/[^\d+()\-\s]/g, ''); // Allow basic dial chars
        if (val.length > 20) val = val.slice(0, 20); // strict 20 char physical limit
        setMobileNumber(val);
    };

    const handleMobileBlur = () => {
        if (!mobileNumber) return;
        // Strip out anything non-numeric
        let digits = mobileNumber.replace(/\D/g, '');

        // Indian standard +91 XXXXX XXXXX formatting if exactly 10 or 12 digits
        if (digits.length === 10) {
            setMobileNumber(`+91 ${digits.slice(0, 5)} ${digits.slice(5)}`);
        } else if (digits.length === 12 && digits.startsWith('91')) {
            setMobileNumber(`+${digits.slice(0, 2)} ${digits.slice(2, 7)} ${digits.slice(7)}`);
        }
    };

    const handleAddressChange = (e) => {
        let text = e.target.value;
        const lines = text.split('\n');

        // Prevent more than 3 hard lines
        if (lines.length > 3) return;

        // Prevent more than 500 characters total for sanity (approx 50-80 words max depending on length)
        if (text.length > 500) text = text.slice(0, 500);

        setShopAddress(text);
    };

    return (
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 w-full">
            {/* Left side: Shop Details */}
            <div className="flex flex-col gap-4 max-w-sm w-full order-2 sm:order-1">
                {/* Logo Area */}
                <div
                    className={`relative group flex items-center justify-center border-2 border-dashed rounded-xl w-32 h-32 cursor-pointer overflow-hidden transition-colors ${logoUrl ? 'border-transparent' : 'border-gray-300 hover:border-blue-400 bg-gray-50'} ${!logoUrl ? 'print:hidden' : ''}`}
                    onClick={clickFileUpload}
                    title="Click to upload logo (Max 500kb)"
                >
                    {logoUrl ? (
                        <>
                            <img src={logoUrl} alt="Shop Logo" className="object-contain w-full h-full" />
                            <button
                                onClick={handleRemoveLogo}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity no-print"
                                title="Remove Logo"
                            >
                                <X size={14} />
                            </button>
                        </>
                    ) : (
                        <div className="flex flex-col items-center text-gray-400 no-print">
                            <ImagePlus size={24} className="mb-2" />
                            <span className="text-[10px] uppercase font-bold tracking-wider">Logo</span>
                        </div>
                    )}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleLogoUpload}
                        accept="image/*"
                        className="hidden"
                    />
                </div>

                {/* Name and Address inputs */}
                <div className="flex flex-col space-y-1">
                    <input
                        type="text"
                        className={`text-3xl font-bold bg-transparent border-none p-0 focus:ring-0 focus:outline-none placeholder-gray-300 !outline-none hover:bg-gray-50 transition-colors rounded-md -ml-2 px-2 print:hover:bg-transparent print:ml-0 print:px-0 text-gray-900 ${!shopName ? 'print:hidden' : ''}`}
                        value={shopName}
                        onChange={(e) => setShopName(e.target.value)}
                        placeholder="Shop Name"
                    />
                    <textarea
                        className={`text-gray-500 bg-transparent border-none p-0 focus:ring-0 focus:outline-none placeholder-gray-300 resize-none overflow-hidden h-18 text-sm !outline-none hover:bg-gray-50 transition-colors rounded-md -ml-2 px-2 print:hover:bg-transparent print:ml-0 print:px-0 ${!shopAddress ? 'print:hidden' : ''}`}
                        value={shopAddress}
                        onChange={handleAddressChange}
                        placeholder="Shop Address (Max 3 Lines)"
                        rows="3"
                        maxLength="500"
                    />
                    <div className={`flex items-center text-gray-500 text-sm mt-1 group ${!mobileNumber ? 'print:hidden' : ''}`}>
                        <span className="mr-2">📞</span>
                        <input
                            type="text"
                            className="bg-transparent border-none p-0 focus:ring-0 focus:outline-none placeholder-gray-300 !outline-none hover:bg-gray-50 transition-colors rounded-md px-2 -ml-2 w-full print:hover:bg-transparent print:ml-0 print:px-0"
                            value={mobileNumber}
                            onChange={handleMobileChange}
                            onBlur={handleMobileBlur}
                            placeholder="Mobile Number"
                        />
                    </div>
                </div>
            </div>

            {/* Right side: Invoice ID and Date */}
            <div className="flex flex-col items-start sm:items-end sm:text-right mt-4 sm:mt-0 order-1 sm:order-2 w-full -ml-2 px-2 sm:ml-0 sm:px-0">
                <h1 className="text-4xl sm:text-5xl font-black text-blue-100 uppercase tracking-tight mb-6">
                    Invoice
                </h1>

                <div className="flex flex-col space-y-3">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Invoice Number</p>
                        <p className="font-semibold text-gray-900">{invoiceNumber}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Date Issued</p>
                        <p className="font-medium text-gray-600">{currentDate}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
