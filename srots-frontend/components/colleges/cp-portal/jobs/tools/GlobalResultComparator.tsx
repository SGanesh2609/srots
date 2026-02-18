import React, { useState, useEffect } from 'react';
import { FileSearch, FileCheck, Wand2, Download, RefreshCw, Loader2, AlertCircle, CheckCircle2, ListFilter } from 'lucide-react';
import { JobService } from '../../../../../services/jobService';

export const GlobalResultComparator: React.FC = () => {
    const [masterFile, setMasterFile] = useState<File | null>(null);
    const [resultFile, setResultFile] = useState<File | null>(null);
    const [masterHeaders, setMasterHeaders] = useState<string[]>([]);
    const [compareField, setCompareField] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isComparisonReady, setIsComparisonReady] = useState(false);
    const [comparisonResult, setComparisonResult] = useState<{
        passed: number;
        failed: number;
        comparisonFieldUsed: string;
        data: any[][];
        exportData: any[][];
        NotInMaster: any[][];
    } | null>(null);

    useEffect(() => {
        const fetchHeaders = async () => {
            if (masterFile) {
                try {
                    const headers = await JobService.getComparisonHeaders(masterFile);
                    setMasterHeaders(headers);
                    if (headers.length > 0) setCompareField(headers[0]);
                } catch (err: any) {
                    console.error("❌ Header fetch failed:", err);
                    alert(`Failed to read headers: ${err.message}`);
                    setMasterFile(null);
                }
            } else {
                setMasterHeaders([]);
                setCompareField('');
            }
        };
        fetchHeaders();
    }, [masterFile]);

    const handleCompare = async () => {
        if (!masterFile || !resultFile) {
            alert("Upload both files");
            return;
        }

        setIsProcessing(true);
        try {
            console.log('🔄 Starting comparison...');
            const result = await JobService.compareResultFiles(masterFile, resultFile, compareField);
            
            if (result.error) {
                alert(`Error: ${result.error}`);
                return;
            }
            
            console.log('✅ Comparison complete:', result);
            setComparisonResult({
                passed: result.passed || 0,
                failed: result.failed || 0,
                comparisonFieldUsed: result.comparisonFieldUsed || compareField,
                data: result.data || [],
                exportData: result.exportData || [],
                NotInMaster: result.NotInMaster || []
            });
            setIsComparisonReady(true);
        } catch (err: any) {
            console.error('❌ Comparison failed:', err);
            alert(`Failed: ${err.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white p-8 rounded-2xl border shadow-sm">
                <div className="flex items-start gap-4 mb-8 border-b pb-6">
                    <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg">
                        <FileSearch size={32}/>
                    </div>
                    <div>
                        <h3 className="font-bold text-2xl text-gray-900">Result Comparator</h3>
                        <p className="text-sm text-gray-500 mt-1">Compare master vs result</p>
                    </div>
                </div>

                {!isComparisonReady ? (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-gray-400 uppercase">1. Master List</label>
                                <div className={`border-2 border-dashed rounded-2xl p-6 text-center ${masterFile ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200'}`}>
                                    <input 
                                        type="file" 
                                        id="masterFile" 
                                        className="hidden" 
                                        accept=".csv,.xlsx,.xls"
                                        onChange={(e) => {
                                            setMasterFile(e.target.files?.[0] || null);
                                            setIsComparisonReady(false);
                                        }} 
                                    />
                                    <label htmlFor="masterFile" className="cursor-pointer">
                                        <FileCheck size={32} className={`mx-auto mb-2 ${masterFile ? 'text-blue-600' : 'text-gray-300'}`} />
                                        <span className="text-sm font-bold text-gray-700 block truncate px-2">
                                            {masterFile ? masterFile.name : 'Upload Master'}
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-bold text-gray-400 uppercase">2. Result List</label>
                                <div className={`border-2 border-dashed rounded-2xl p-6 text-center ${resultFile ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200'}`}>
                                    <input 
                                        type="file" 
                                        id="resultFile" 
                                        className="hidden" 
                                        accept=".csv,.xlsx,.xls"
                                        onChange={(e) => {
                                            setResultFile(e.target.files?.[0] || null);
                                            setIsComparisonReady(false);
                                        }} 
                                    />
                                    <label htmlFor="resultFile" className="cursor-pointer">
                                        <AlertCircle size={32} className={`mx-auto mb-2 ${resultFile ? 'text-blue-600' : 'text-gray-300'}`} />
                                        <span className="text-sm font-bold text-gray-700 block truncate px-2">
                                            {resultFile ? resultFile.name : 'Upload Result'}
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {masterHeaders.length > 0 && (
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
                                    <ListFilter size={16} className="text-blue-500" /> 3. Field
                                </label>
                                <select 
                                    value={compareField} 
                                    onChange={(e) => setCompareField(e.target.value)}
                                    className="w-full p-4 bg-gray-50 border rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-100"
                                >
                                    {masterHeaders.map((h, i) => <option key={i} value={h}>{h}</option>)}
                                </select>
                            </div>
                        )}

                        <button 
                            onClick={handleCompare}
                            disabled={!masterFile || !resultFile || isProcessing}
                            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Wand2 size={20} />}
                            {isProcessing ? 'Comparing...' : 'Start Comparison'}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="p-8 bg-blue-50 border border-blue-200 rounded-3xl text-center">
                            <CheckCircle2 size={48} className="text-blue-600 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Complete!</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Field: <span className="font-bold">{comparisonResult?.comparisonFieldUsed}</span>
                            </p>
                            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                                <div className="bg-white p-4 rounded-2xl border shadow-sm">
                                    <span className="block text-3xl font-black text-green-600">{comparisonResult?.passed}</span>
                                    <span className="text-xs font-bold text-gray-400">PASSED</span>
                                </div>
                                <div className="bg-white p-4 rounded-2xl border shadow-sm">
                                    <span className="block text-3xl font-black text-red-500">{comparisonResult?.failed}</span>
                                    <span className="text-xs font-bold text-gray-400">FAILED</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            {/* INLINE ASYNC HANDLER - Excel */}
                            <button 
                                onClick={async (e) => {
                                    e.preventDefault();
                                    console.log('🔽 Excel download clicked');
                                    if (!comparisonResult?.exportData) {
                                        alert("No data");
                                        return;
                                    }
                                    try {
                                        console.log('📤 Calling download service...');
                                        await JobService.downloadComparisonReport(comparisonResult.exportData, 'excel');
                                        console.log('✅ Download complete');
                                    } catch (err: any) {
                                        console.error('❌ Download failed:', err);
                                        alert(`Failed: ${err.message}`);
                                    }
                                }}
                                className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 shadow-lg active:scale-95 transition"
                            >
                                <Download size={20}/> Excel
                            </button>

                            {/* INLINE ASYNC HANDLER - CSV */}
                            <button 
                                onClick={async (e) => {
                                    e.preventDefault();
                                    console.log('🔽 CSV download clicked');
                                    if (!comparisonResult?.exportData) {
                                        alert("No data");
                                        return;
                                    }
                                    try {
                                        console.log('📤 Calling download service...');
                                        await JobService.downloadComparisonReport(comparisonResult.exportData, 'csv');
                                        console.log('✅ Download complete');
                                    } catch (err: any) {
                                        console.error('❌ Download failed:', err);
                                        alert(`Failed: ${err.message}`);
                                    }
                                }}
                                className="flex-1 py-4 bg-white border-2 border-green-600 text-green-700 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-green-50 active:scale-95 transition"
                            >
                                <Download size={20}/> CSV
                            </button>
                        </div>

                        {/* INLINE RESET HANDLER */}
                        <button 
                            onClick={(e) => {
                                e.preventDefault();
                                console.log('🔄 Resetting comparator...');
                                setMasterFile(null);
                                setResultFile(null);
                                setIsComparisonReady(false);
                                setComparisonResult(null);
                                setMasterHeaders([]);
                                setCompareField('');
                                const m = document.getElementById('masterFile') as HTMLInputElement;
                                const r = document.getElementById('resultFile') as HTMLInputElement;
                                if (m) m.value = '';
                                if (r) r.value = '';
                                console.log('✅ Reset complete');
                            }}
                            className="w-full py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 active:scale-95 transition"
                        >
                            <RefreshCw size={20}/> New Comparison
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
