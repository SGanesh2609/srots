import React, { useState, useEffect } from 'react';
import { Plus, Edit2, X } from 'lucide-react';
import { Branch } from '../../../../../types';

interface AddBranchFormProps {
    onAdd: (name: string, code: string) => void;
    editData: Branch | null;
    onCancel: () => void;
}

export const AddBranchForm: React.FC<AddBranchFormProps> = ({ onAdd, editData, onCancel }) => {
    const [name, setName] = useState('');
    const [code, setCode] = useState('');

    useEffect(() => {
        if (editData) {
            setName(editData.name);
            setCode(editData.code);
        } else {
            setName('');
            setCode('');
        }
    }, [editData]);

    const handleSubmit = () => {
        if (name.trim() && code.trim()) {
            onAdd(name, code);
            setName('');
            setCode('');
        }
    };

    return (
        <div className={`p-4 rounded-xl mb-6 border-2 ${editData ? 'border-amber-200 bg-amber-50' : 'border-gray-100 bg-gray-50'}`}>
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 flex flex-col sm:flex-row gap-2">
                    <input 
                        className="flex-[2] border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none bg-white text-gray-900" 
                        placeholder="Full Course Name (e.g. Computer Science)" 
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                    <input 
                        className="flex-1 sm:w-32 border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none bg-white text-gray-900" 
                        placeholder="Code (CSE)" 
                        value={code}
                        disabled={!!editData} // Code is usually the unique identifier, disable edit if updating
                        onChange={e => setCode(e.target.value)}
                    />
                    <button 
                        onClick={handleSubmit} 
                        className={`px-6 py-2 rounded-lg font-bold text-white flex items-center justify-center gap-2 shadow-sm ${editData ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {editData ? <><Edit2 size={18}/> Update</> : <><Plus size={18}/> Add</>}
                    </button>
                    {editData && (
                        <button onClick={onCancel} className="p-2.5 text-gray-500 hover:bg-gray-200 rounded-lg">
                            <X size={20}/>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};