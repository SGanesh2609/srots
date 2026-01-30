
import React, { useState, useEffect } from 'react';
import { Settings, Wifi, WifiOff, Save, RotateCcw, AlertCircle } from 'lucide-react';
import { Modal } from '../../../common/Modal';

export const IntegrationPanel: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState(localStorage.getItem('SROTS_API_MODE') || 'SIMULATED');
    const [url, setUrl] = useState(localStorage.getItem('SROTS_API_LIVE_URL') || 'http://localhost:8080/api/v1');

    const handleSave = () => {
        localStorage.setItem('SROTS_API_MODE', mode);
        localStorage.setItem('SROTS_API_LIVE_URL', url);
        window.location.reload();
    };

    const reset = () => {
        localStorage.removeItem('SROTS_API_MODE');
        localStorage.removeItem('SROTS_API_LIVE_URL');
        window.location.reload();
    };

    return (
        <>
            <button 
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-4 right-4 p-3 rounded-full shadow-2xl z-[100] transition-all transform hover:scale-110 flex items-center gap-2 font-bold text-xs ${mode === 'LIVE' ? 'bg-green-600 text-white' : 'bg-slate-800 text-white'}`}
            >
                {mode === 'LIVE' ? <Wifi size={18}/> : <WifiOff size={18}/>}
                <span>API: {mode}</span>
            </button>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Backend Integration Settings" maxWidth="max-w-md">
                <div className="p-6 space-y-6">
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3 items-start">
                        <AlertCircle className="text-amber-600 shrink-0" size={20}/>
                        <p className="text-xs text-amber-800">
                            <strong>Note:</strong> Switching to "LIVE" mode will bypass simulated data. Ensure your Java/Node backend is running and CORS is enabled for * or this origin.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Request Routing</label>
                            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
                                <button 
                                    onClick={() => setMode('SIMULATED')}
                                    className={`py-2 rounded-lg text-xs font-bold transition-all ${mode === 'SIMULATED' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Simulator (Mock)
                                </button>
                                <button 
                                    onClick={() => setMode('LIVE')}
                                    className={`py-2 rounded-lg text-xs font-bold transition-all ${mode === 'LIVE' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Live (External)
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Live API Base URL</label>
                            <input 
                                className="w-full p-3 border rounded-xl bg-gray-50 text-gray-900 font-mono text-xs focus:ring-2 focus:ring-blue-100 outline-none"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="http://localhost:8080/api/v1"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t">
                        <button onClick={reset} className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-gray-200">
                            <RotateCcw size={16}/> Default
                        </button>
                        <button onClick={handleSave} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-100 hover:bg-blue-700">
                            <Save size={16}/> Apply Changes
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
};
