import React, { useState, useEffect } from 'react';
import { Filter, FileSpreadsheet, Trash2, Wand2, Download, RefreshCw, ListX, Users, Loader2, CheckCircle2 } from 'lucide-react';
import { JobService } from '../../../../../services/jobService';

/**
 * Component: GlobalReportExtractor
 * SYNCED WITH: PlacementToolsController.java - /api/v1/tools/extract/*
 * 
 * FIXES:
 * - Download buttons now properly await async calls
 * - Reset button clears all state
 * - Proper error handling
 */

export const GlobalReportExtractor: React.FC = () => {
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [fileHeaders, setFileHeaders] = useState<string[]>([]);
  const [excludeHeaderNames, setExcludeHeaderNames] = useState<string[]>([]);
  const [reportExcludeInput, setReportExcludeInput] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCustomReportReady, setIsCustomReportReady] = useState(false);
  const [processingStats, setProcessingStats] = useState({ originalRows: 0, finalRows: 0, removedFieldsCount: 0 });
  const [processedReportData, setProcessedReportData] = useState<any[][] | null>(null);

  useEffect(() => {
      const getHeaders = async () => {
          if (reportFile) {
              try {
                  const headers = await JobService.getExtractionHeaders(reportFile);
                  setFileHeaders(headers);
                  setExcludeHeaderNames([]);
              } catch (err: any) {
                  console.error("Header fetch error:", err);
                  const errorMsg = err.response?.data?.message || err.message || "Failed to read headers";
                  alert(`Failed to read file headers: ${errorMsg}\nEnsure the file is a valid Excel or CSV.`);
                  setReportFile(null);
              }
          } else {
              setFileHeaders([]);
              setExcludeHeaderNames([]);
          }
      };
      getHeaders();
  }, [reportFile]);

  const toggleHeaderExclusion = (header: string) => {
      setExcludeHeaderNames(prev => 
          prev.includes(header) ? prev.filter(h => h !== header) : [...prev, header]
      );
  };

  const handleGenerateCustomReport = async () => {
      if (!reportFile) {
          alert("Please upload a file first");
          return;
      }

      setIsProcessing(true);
      try {
          const excludeColsStr = excludeHeaderNames.join(',');
          const result = await JobService.processCustomReport(reportFile, excludeColsStr, reportExcludeInput);
          
          setProcessingStats({
              originalRows: result.originalRows || 0,
              finalRows: result.finalRows || 0,
              removedFieldsCount: result.removedFieldsCount || 0
          });
          setProcessedReportData(result.data);
          setIsCustomReportReady(true);
      } catch (err: any) { 
          console.error("Processing error:", err);
          const errorMsg = err.response?.data?.message || err.message || "Processing failed";
          alert(`Error processing file: ${errorMsg}`);
      } finally {
          setIsProcessing(false);
      }
  };

  const handleDownload = async (format: 'csv' | 'xlsx') => {
      if (!processedReportData) {
          alert("No data to download");
          return;
      }
      try {
          // FIXED: Properly await the download
          await JobService.downloadCustomReport(processedReportData, format === 'csv' ? 'csv' : 'excel');
      } catch (err) {
          console.error("Download error:", err);
          alert("Download failed. Please try again.");
      }
  };

  const handleReset = () => {
      // FIXED: Clear ALL state
      setIsCustomReportReady(false); 
      setReportFile(null); 
      setFileHeaders([]);
      setExcludeHeaderNames([]); 
      setReportExcludeInput(''); 
      setProcessedReportData(null);
      setProcessingStats({ originalRows: 0, finalRows: 0, removedFieldsCount: 0 });
      
      // Reset file input
      const fileInput = document.getElementById('extractorFile') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
  };

  return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2">
           <div className="bg-white p-8 rounded-2xl border shadow-sm border-purple-200">
               <div className="flex items-start gap-4 mb-8 border-b pb-6">
                   <div className="bg-purple-600 p-3 rounded-2xl text-white shadow-lg shadow-purple-100"><Filter size={32}/></div>
                   <div>
                       <h3 className="font-bold text-2xl text-gray-900 tracking-tight">Report Data Extractor</h3>
                       <p className="text-sm text-gray-500 mt-1 max-w-2xl font-medium">Cleanse your master data by removing unwanted columns and excluding specific students from the final output.</p>
                   </div>
               </div>
               
               {!isCustomReportReady ? (
                   <div className="space-y-8">
                       <div className="space-y-3">
                           <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Step 1: Source File</label>
                           <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${reportFile ? 'border-purple-500 bg-purple-50/30' : 'border-gray-200 hover:border-purple-300 bg-gray-50/30'}`}>
                               <input 
                                   type="file" 
                                   className="hidden" 
                                   id="extractorFile" 
                                   accept=".csv, .xlsx, .xls" 
                                   onChange={(e) => {
                                       setReportFile(e.target.files?.[0] || null);
                                       setIsCustomReportReady(false);
                                   }} 
                               />
                               <label htmlFor="extractorFile" className="cursor-pointer block">
                                   <FileSpreadsheet size={48} className={`mx-auto mb-3 transition-colors ${reportFile ? 'text-purple-600' : 'text-gray-300'}`} />
                                   <span className="text-base font-bold text-gray-700 block truncate px-4">{reportFile ? reportFile.name : 'Upload Master Excel/CSV'}</span>
                                   {!reportFile && <span className="text-xs text-gray-400 font-medium mt-1 block">Drop the full student data sheet here</span>}
                               </label>
                           </div>
                       </div>

                       {reportFile && fileHeaders.length > 0 && (
                           <div className="animate-in slide-in-from-top-4 space-y-4">
                               <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <ListX size={16} className="text-purple-500" /> Step 2: Select Columns to Remove
                                    </label>
                                    <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-100 uppercase">
                                        {excludeHeaderNames.length} Marked for Removal
                                    </span>
                               </div>
                               <div className="flex flex-wrap gap-2 p-5 bg-gray-50 rounded-2xl border border-gray-200 max-h-64 overflow-y-auto">
                                   {fileHeaders.map((header, idx) => {
                                       const isExcluded = excludeHeaderNames.includes(header);
                                       return (
                                           <button 
                                               key={`${header}-${idx}`}
                                               onClick={() => toggleHeaderExclusion(header)}
                                               className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-2 ${isExcluded ? 'bg-red-500 text-white border-red-500 shadow-md scale-95' : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400'}`}
                                           >
                                               {isExcluded ? <Trash2 size={12}/> : <div className="w-3 h-3 rounded-full border border-gray-300"></div>}
                                               {header}
                                           </button>
                                       );
                                   })}
                               </div>
                           </div>
                       )}

                       {reportFile && (
                           <div className="animate-in slide-in-from-top-4 space-y-3">
                               <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                   <Users size={16} className="text-purple-500" /> Step 3: Exclude Students (Optional)
                               </label>
                               <textarea 
                                   className="w-full p-4 border border-gray-200 rounded-2xl text-sm font-mono focus:ring-2 focus:ring-purple-100 outline-none resize-none bg-white text-gray-900 min-h-[120px]" 
                                   placeholder={`Enter Roll Numbers separated by commas or new lines...\nExample:\n20701A0501\n20701A0502`} 
                                   value={reportExcludeInput} 
                                   onChange={(e) => { 
                                       setReportExcludeInput(e.target.value); 
                                       setIsCustomReportReady(false); 
                                   }} 
                               />
                               <p className="text-xs text-gray-500 italic">
                                   {reportExcludeInput.split(/[\n,]+/).filter(x => x.trim()).length} students will be excluded
                               </p>
                           </div>
                       )}

                       <div className="pt-4 border-t border-gray-100">
                           <button 
                               onClick={handleGenerateCustomReport} 
                               disabled={!reportFile || isProcessing} 
                               className={`w-full py-4 rounded-xl font-bold text-base shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95 ${!reportFile || isProcessing ? 'bg-gray-100 text-gray-400 cursor-not-allowed border' : 'bg-purple-600 text-white hover:bg-purple-700 shadow-purple-100'}`}
                           >
                               {isProcessing ? <Loader2 size={24} className="animate-spin"/> : <Wand2 size={20}/>}
                               {isProcessing ? 'Processing...' : 'Generate Clean Report'}
                           </button>
                       </div>
                   </div>
               ) : (
                   <div className="space-y-6 animate-in zoom-in duration-300">
                       <div className="p-8 bg-green-50 border border-green-200 rounded-2xl text-center">
                           <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                               <CheckCircle2 size={32} />
                           </div>
                           <h3 className="text-2xl font-bold text-green-900 mb-2">Report Extracted!</h3>
                           <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-8">
                               <div className="bg-white p-4 rounded-xl border border-green-200 shadow-sm">
                                   <span className="block text-2xl font-extrabold text-gray-800 leading-none mb-1">{processingStats.originalRows}</span>
                                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Input Rows</span>
                               </div>
                               <div className="bg-white p-4 rounded-xl border border-red-100 shadow-sm">
                                   <span className="block text-2xl font-extrabold text-red-500 leading-none mb-1">{processingStats.removedFieldsCount}</span>
                                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cols Removed</span>
                               </div>
                               <div className="bg-white p-4 rounded-xl border border-green-200 shadow-sm">
                                   <span className="block text-2xl font-extrabold text-green-600 leading-none mb-1">{processingStats.finalRows}</span>
                                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Output Rows</span>
                               </div>
                           </div>
                           <div className="flex flex-col sm:flex-row gap-4 justify-center">
                               <button 
                                   onClick={() => handleDownload('xlsx')} 
                                   className="flex-1 px-6 py-3.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 flex items-center justify-center gap-2 shadow-lg shadow-green-100 transition-all active:scale-95"
                               >
                                   <Download size={20}/> Excel (.xlsx)
                               </button>
                               <button 
                                   onClick={() => handleDownload('csv')} 
                                   className="flex-1 px-6 py-3.5 bg-white border-2 border-green-600 text-green-700 rounded-xl font-bold text-sm hover:bg-green-50 flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
                               >
                                   <Download size={20}/> CSV (.csv)
                               </button>
                           </div>
                       </div>
                       <button 
                           onClick={handleReset} 
                           className="w-full py-3 bg-gray-100 hover:bg-purple-50 text-gray-600 font-bold text-sm rounded-xl border border-gray-200 flex items-center justify-center gap-2 transition-all active:scale-95"
                       >
                           <RefreshCw size={16}/> Extract Another File
                       </button>
                   </div>
               )}
           </div>
      </div>
  );
};
