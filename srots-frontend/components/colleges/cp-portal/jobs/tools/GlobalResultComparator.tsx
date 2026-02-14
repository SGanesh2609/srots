import React, { useState, useEffect } from 'react';
import { FileSearch, FileCheck, Wand2, Download, RefreshCw, Loader2, AlertCircle, CheckCircle2, ListFilter } from 'lucide-react';
import { JobService } from '../../../../../services/jobService';

/**
 * Component: GlobalResultComparator
 * SYNCED WITH: PlacementToolsController.java - /api/v1/tools/compare/*
 * 
 * CRITICAL FIX: Backend expects @RequestParam("file"), not @RequestPart
 * All business logic in backend, frontend only handles UI state
 */

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

    // Fetch headers when master file changes
    useEffect(() => {
        const fetchHeaders = async () => {
            if (masterFile) {
                try {
                    const headers = await JobService.getComparisonHeaders(masterFile);
                    setMasterHeaders(headers);
                    // Auto-select first header
                    if (headers.length > 0) {
                        setCompareField(headers[0]);
                    }
                } catch (err: any) {
                    console.error("Header Fetch Error:", err);
                    const errorMsg = err.response?.data?.message || err.message || "Could not read file headers";
                    alert(`Failed to read master file: ${errorMsg}`);
                    setMasterFile(null);
                    setMasterHeaders([]);
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
            alert("Please upload both Master and Result files.");
            return;
        }

        setIsProcessing(true);
        try {
            // Backend auto-fallback if compareField is empty: Email → Roll Number
            const result = await JobService.compareResultFiles(masterFile, resultFile, compareField);
            
            // Check for backend errors
            if (result.error) {
                alert(`Comparison Error: ${result.error}`);
                setIsProcessing(false);
                return;
            }
            
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
            console.error("Comparison Error:", err);
            const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Comparison failed";
            alert(`Comparison failed: ${errorMsg}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = async (format: 'excel' | 'csv') => {
        if (!comparisonResult?.exportData) {
            alert("No data to download");
            return;
        }
        try {
            await JobService.downloadComparisonReport(comparisonResult.exportData, format);
        } catch (err) {
            console.error("Download error:", err);
            alert("Download failed. Please try again.");
        }
    };

    const handleReset = () => {
        setMasterFile(null);
        setResultFile(null);
        setIsComparisonReady(false);
        setComparisonResult(null);
        setMasterHeaders([]);
        setCompareField('');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-white p-8 rounded-2xl border shadow-sm border-blue-200">
                <div className="flex items-start gap-4 mb-8 border-b pb-6">
                    <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-100"><FileSearch size={32}/></div>
                    <div>
                        <h3 className="font-bold text-2xl text-gray-900 tracking-tight">Result Comparator</h3>
                        <p className="text-sm text-gray-500 mt-1 max-w-2xl font-medium">Compare a Master student list against a result file to identify who cleared the round or is missing.</p>
                    </div>
                </div>

                {!isComparisonReady ? (
                    <div className="space-y-8">
                        {/* Step 1: Files Upload */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">1. Master List (Full Data)</label>
                                <div className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${masterFile ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200 hover:border-blue-300'}`}>
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
                                        <span className="text-sm font-bold text-gray-700 block truncate px-2">{masterFile ? masterFile.name : 'Upload Master File'}</span>
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">2. Result List (Shortlisted)</label>
                                <div className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${resultFile ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200 hover:border-blue-300'}`}>
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
                                        <span className="text-sm font-bold text-gray-700 block truncate px-2">{resultFile ? resultFile.name : 'Upload Result File'}</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Step 2: Compare Field Selection */}
                        {masterHeaders.length > 0 && (
                            <div className="animate-in slide-in-from-top-4 space-y-3">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <ListFilter size={16} className="text-blue-500" /> 3. Select Comparison Field
                                </label>
                                <select 
                                    value={compareField} 
                                    onChange={(e) => setCompareField(e.target.value)}
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-100"
                                >
                                    {masterHeaders.map((h, i) => <option key={i} value={h}>{h}</option>)}
                                </select>
                                <p className="text-xs text-gray-500 italic">If left empty, backend will auto-detect Email or Roll Number columns</p>
                            </div>
                        )}

                        <button 
                            onClick={handleCompare}
                            disabled={!masterFile || !resultFile || isProcessing}
                            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 active:scale-95"
                        >
                            {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Wand2 size={20} />}
                            {isProcessing ? 'Comparing Data...' : 'Start Comparison'}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in zoom-in duration-300">
                        <div className="p-8 bg-blue-50 border border-blue-100 rounded-3xl text-center">
                            <CheckCircle2 size={48} className="text-blue-600 mx-auto mb-4" />
                            <h3 className="text-2xl font-black text-gray-900 mb-2">Comparison Complete</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Compared using: <span className="font-bold text-blue-700">{comparisonResult?.comparisonFieldUsed}</span>
                            </p>
                            <div className="grid grid-cols-2 gap-4 mt-6 max-w-sm mx-auto">
                                <div className="bg-white p-4 rounded-2xl border shadow-sm">
                                    <span className="block text-3xl font-black text-green-600">{comparisonResult?.passed}</span>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Passed</span>
                                </div>
                                <div className="bg-white p-4 rounded-2xl border shadow-sm">
                                    <span className="block text-3xl font-black text-red-500">{comparisonResult?.failed}</span>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Failed</span>
                                </div>
                            </div>
                            {comparisonResult?.NotInMaster && comparisonResult.NotInMaster.length > 0 && (
                                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                    <p className="text-xs font-bold text-orange-800">
                                        ⚠️ {comparisonResult.NotInMaster.length} entries in Result but not in Master
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button 
                                onClick={() => handleDownload('excel')} 
                                className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 shadow-lg shadow-green-100 transition-all active:scale-95"
                            >
                                <Download size={20}/> Download Excel
                            </button>
                            <button 
                                onClick={() => handleDownload('csv')} 
                                className="flex-1 py-4 bg-white border-2 border-green-600 text-green-700 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-green-50 shadow-sm transition-all active:scale-95"
                            >
                                <Download size={20}/> Download CSV
                            </button>
                        </div>

                        <button 
                            onClick={handleReset} 
                            className="w-full py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-all active:scale-95"
                        >
                            <RefreshCw size={20}/> New Comparison
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
