
// import React, { useState } from 'react';
// import { Search, Loader2 } from 'lucide-react';
// import { INDIAN_STATES, MAJOR_CITIES } from '../../constants';
// import { AddressFormData } from '../../types';

// /**
//  * Component Name: AddressForm
//  * Directory: components/common/AddressForm.tsx
//  * 
//  * Functionality:
//  * - Reusable form for capturing detailed Indian address information.
//  * - Features: Auto-fetch details via Pincode API.
//  */

// interface AddressFormProps {
//     data: AddressFormData;
//     onChange: (data: AddressFormData) => void;
//     title?: string;
//     onCopy?: () => void;
//     copyLabel?: string;
// }

// export const AddressForm: React.FC<AddressFormProps> = ({ data, onChange, title, onCopy, copyLabel }) => {
//     const [isPincodeLoading, setIsPincodeLoading] = useState(false);
//     const [availableVillages, setAvailableVillages] = useState<string[]>([]);

//     const updateField = (field: keyof AddressFormData, value: string) => {
//         onChange({ ...data, [field]: value });
//     };

//     const handlePincodeLookup = async () => {
//         if (!data.zip || data.zip.length < 6) {
//             alert("Please enter a valid 6-digit Pincode.");
//             return;
//         }
        
//         setIsPincodeLoading(true);
//         setAvailableVillages([]); 
//         try {
//             const response = await fetch(`https://api.postalpincode.in/pincode/${data.zip}`);
//             const apiData = await response.json();

//             if (apiData && apiData[0] && apiData[0].Status === "Success") {
//                 const postOffices = apiData[0].PostOffice;
//                 const firstPO = postOffices[0];
                
//                 const villages = postOffices.map((po: any) => po.Name);
//                 setAvailableVillages(villages);

//                 onChange({
//                     ...data,
//                     mandal: firstPO.Block,
//                     city: firstPO.District,
//                     state: firstPO.State,
//                     country: firstPO.Country,
//                     village: villages[0] || ''
//                 });
//             } else {
//                 alert("Pincode not found. Please enter details manually.");
//             }
//         } catch (error) {
//             console.error("Pincode fetch error:", error);
//             alert("Could not fetch address details automatically.");
//         } finally {
//             setIsPincodeLoading(false);
//         }
//     };

//     return (
//         <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
//             {title && (
//                 <div className="flex justify-between items-center mb-3 border-b border-blue-200 pb-1">
//                     <h4 className="font-bold text-blue-900 text-sm uppercase">{title}</h4>
//                     {onCopy && copyLabel && (
//                         <button onClick={onCopy} className="text-[10px] text-blue-600 hover:underline font-bold">
//                             {copyLabel}
//                         </button>
//                     )}
//                 </div>
//             )}

//             {isPincodeLoading && (
//                 <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded-lg backdrop-blur-[1px]">
//                     <Loader2 size={32} className="text-blue-600 animate-spin"/>
//                 </div>
//             )}
            
//             <div>
//                 <label className="text-[10px] font-bold text-gray-400 uppercase">Address Line 1 <span className="text-red-500">*</span></label>
//                 <input 
//                     className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-100 outline-none text-sm bg-white text-gray-900" 
//                     placeholder="Street, Building Name" 
//                     value={data.addressLine1} 
//                     onChange={e => updateField('addressLine1', e.target.value)} 
//                 />
//             </div>
//             <div>
//                 <label className="text-[10px] font-bold text-gray-400 uppercase">Address Line 2</label>
//                 <input 
//                     className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-100 outline-none text-sm bg-white text-gray-900" 
//                     placeholder="Apartment, Suite" 
//                     value={data.addressLine2} 
//                     onChange={e => updateField('addressLine2', e.target.value)} 
//                 />
//             </div>

//             <div className="grid grid-cols-2 gap-3">
//                 <div className="relative">
//                     <label className="text-[10px] font-bold text-gray-400 uppercase">Zip Code <span className="text-red-500">*</span></label>
//                     <div className="flex">
//                         <input 
//                             className="w-full border p-2 rounded-l focus:ring-2 focus:ring-blue-100 outline-none text-sm bg-white text-gray-900" 
//                             placeholder="e.g. 500081" 
//                             value={data.zip} 
//                             onChange={e => updateField('zip', e.target.value)} 
//                         />
//                         <button 
//                             onClick={handlePincodeLookup} 
//                             className="bg-blue-600 text-white px-3 rounded-r hover:bg-blue-700 flex items-center justify-center transition-colors" 
//                         >
//                             <Search size={14} />
//                         </button>
//                     </div>
//                 </div>
//                 <div>
//                     <label className="text-[10px] font-bold text-gray-400 uppercase">Village / Area</label>
//                     {availableVillages.length > 0 ? (
//                         <select 
//                             className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-100 outline-none text-sm bg-white text-gray-900" 
//                             value={data.village} 
//                             onChange={e => updateField('village', e.target.value)}
//                         >
//                             {availableVillages.map((v, idx) => <option key={idx} value={v}>{v}</option>)}
//                         </select>
//                     ) : (
//                         <input 
//                             className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-100 outline-none text-sm bg-white text-gray-900" 
//                             placeholder="Village Name" 
//                             value={data.village} 
//                             onChange={e => updateField('village', e.target.value)} 
//                         />
//                     )}
//                 </div>
//             </div>
            
//             <div className="grid grid-cols-2 gap-3">
//                 <div>
//                     <label className="text-[10px] font-bold text-gray-400 uppercase">Mandal / Block</label>
//                     <input 
//                         className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-100 outline-none text-sm bg-white text-gray-900" 
//                         placeholder="Mandal Name" 
//                         value={data.mandal} 
//                         onChange={e => updateField('mandal', e.target.value)} 
//                     />
//                 </div>
//                 <div>
//                     <label className="text-[10px] font-bold text-gray-400 uppercase">City / District <span className="text-red-500">*</span></label>
//                     <input 
//                         list="city-options" 
//                         className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-100 outline-none text-sm bg-white text-gray-900" 
//                         placeholder="District / City" 
//                         value={data.city} 
//                         onChange={e => updateField('city', e.target.value)} 
//                     />
//                     <datalist id="city-options">{MAJOR_CITIES.map(city => <option key={city} value={city} />)}</datalist>
//                 </div>
//             </div>

//             <div className="grid grid-cols-2 gap-3">
//                 <div>
//                     <label className="text-[10px] font-bold text-gray-400 uppercase">State / Region <span className="text-red-500">*</span></label>
//                     <input 
//                         list="state-options" 
//                         className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-100 outline-none text-sm bg-white text-gray-900" 
//                         placeholder="State Name" 
//                         value={data.state} 
//                         onChange={e => updateField('state', e.target.value)} 
//                     />
//                     <datalist id="state-options">{INDIAN_STATES.map(state => <option key={state} value={state} />)}</datalist>
//                 </div>
//                 <div>
//                     <label className="text-[10px] font-bold text-gray-400 uppercase">Country</label>
//                     <input 
//                         className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-100 outline-none text-sm bg-gray-100 text-gray-900" 
//                         value={data.country} 
//                         readOnly 
//                     />
//                 </div>
//             </div>
//         </div>
//     );
// };


import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { INDIAN_STATES, MAJOR_CITIES } from '../../constants';
import { AddressFormData } from '../../types';

/**
 * Component Name: AddressForm
 * Directory: components/common/AddressForm.tsx
 * 
 * Changes:
 * - Fixed duplicate key warning in <datalist> by using index as part of key
 * - No visual/UI changes — looks exactly the same
 */

interface AddressFormProps {
    data: AddressFormData;
    onChange: (data: AddressFormData) => void;
    title?: string;
    onCopy?: () => void;
    copyLabel?: string;
}

export const AddressForm: React.FC<AddressFormProps> = ({ data, onChange, title, onCopy, copyLabel }) => {
    const [isPincodeLoading, setIsPincodeLoading] = useState(false);
    const [availableVillages, setAvailableVillages] = useState<string[]>([]);

    const updateField = (field: keyof AddressFormData, value: string) => {
        onChange({ ...data, [field]: value });
    };

    const handlePincodeLookup = async () => {
        if (!data.zip || data.zip.length < 6) {
            alert("Please enter a valid 6-digit Pincode.");
            return;
        }
        
        setIsPincodeLoading(true);
        setAvailableVillages([]); 
        try {
            const response = await fetch(`https://api.postalpincode.in/pincode/${data.zip}`);
            const apiData = await response.json();

            if (apiData && apiData[0] && apiData[0].Status === "Success") {
                const postOffices = apiData[0].PostOffice;
                const firstPO = postOffices[0];
                
                const villages = postOffices.map((po: any) => po.Name);
                setAvailableVillages(villages);

                onChange({
                    ...data,
                    mandal: firstPO.Block,
                    city: firstPO.District,
                    state: firstPO.State,
                    country: firstPO.Country,
                    village: villages[0] || ''
                });
            } else {
                alert("Pincode not found. Please enter details manually.");
            }
        } catch (error) {
            console.error("Pincode fetch error:", error);
            alert("Could not fetch address details automatically.");
        } finally {
            setIsPincodeLoading(false);
        }
    };

    return (
        <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
            {title && (
                <div className="flex justify-between items-center mb-3 border-b border-blue-200 pb-1">
                    <h4 className="font-bold text-blue-900 text-sm uppercase">{title}</h4>
                    {onCopy && copyLabel && (
                        <button onClick={onCopy} className="text-[10px] text-blue-600 hover:underline font-bold">
                            {copyLabel}
                        </button>
                    )}
                </div>
            )}

            {isPincodeLoading && (
                <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded-lg backdrop-blur-[1px]">
                    <Loader2 size={32} className="text-blue-600 animate-spin"/>
                </div>
            )}
            
            <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase">Address Line 1 <span className="text-red-500">*</span></label>
                <input 
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-100 outline-none text-sm bg-white text-gray-900" 
                    placeholder="Street, Building Name" 
                    value={data.addressLine1} 
                    onChange={e => updateField('addressLine1', e.target.value)} 
                />
            </div>
            <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase">Address Line 2</label>
                <input 
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-100 outline-none text-sm bg-white text-gray-900" 
                    placeholder="Apartment, Suite" 
                    value={data.addressLine2} 
                    onChange={e => updateField('addressLine2', e.target.value)} 
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Zip Code <span className="text-red-500">*</span></label>
                    <div className="flex">
                        <input 
                            className="w-full border p-2 rounded-l focus:ring-2 focus:ring-blue-100 outline-none text-sm bg-white text-gray-900" 
                            placeholder="e.g. 500081" 
                            value={data.zip} 
                            onChange={e => updateField('zip', e.target.value)} 
                        />
                        <button 
                            onClick={handlePincodeLookup} 
                            className="bg-blue-600 text-white px-3 rounded-r hover:bg-blue-700 flex items-center justify-center transition-colors" 
                        >
                            <Search size={14} />
                        </button>
                    </div>
                </div>
                <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Village / Area</label>
                    {availableVillages.length > 0 ? (
                        <select 
                            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-100 outline-none text-sm bg-white text-gray-900" 
                            value={data.village} 
                            onChange={e => updateField('village', e.target.value)}
                        >
                            {availableVillages.map((v, idx) => (
                                <option key={`${v}-${idx}`} value={v}>{v}</option>
                            ))}
                        </select>
                    ) : (
                        <input 
                            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-100 outline-none text-sm bg-white text-gray-900" 
                            placeholder="Village Name" 
                            value={data.village} 
                            onChange={e => updateField('village', e.target.value)} 
                        />
                    )}
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Mandal / Block</label>
                    <input 
                        className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-100 outline-none text-sm bg-white text-gray-900" 
                        placeholder="Mandal Name" 
                        value={data.mandal} 
                        onChange={e => updateField('mandal', e.target.value)} 
                    />
                </div>
                <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">City / District <span className="text-red-500">*</span></label>
                    <input 
                        list="city-options" 
                        className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-100 outline-none text-sm bg-white text-gray-900" 
                        placeholder="District / City" 
                        value={data.city} 
                        onChange={e => updateField('city', e.target.value)} 
                    />
                    <datalist id="city-options">
                        {MAJOR_CITIES.map((city, index) => (
                            <option key={`${city}-${index}`} value={city} />
                        ))}
                    </datalist>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">State / Region <span className="text-red-500">*</span></label>
                    <input 
                        list="state-options" 
                        className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-100 outline-none text-sm bg-white text-gray-900" 
                        placeholder="State Name" 
                        value={data.state} 
                        onChange={e => updateField('state', e.target.value)} 
                    />
                    <datalist id="state-options">
                        {INDIAN_STATES.map((state, index) => (
                            <option key={`${state}-${index}`} value={state} />
                        ))}
                    </datalist>
                </div>
                <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Country</label>
                    <input 
                        className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-100 outline-none text-sm bg-gray-100 text-gray-900" 
                        value={data.country} 
                        readOnly 
                    />
                </div>
            </div>
        </div>
    );
};