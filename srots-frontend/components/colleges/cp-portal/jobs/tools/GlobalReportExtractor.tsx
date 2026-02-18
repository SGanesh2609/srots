import React, { useState, useEffect } from 'react';
import { Filter, FileSpreadsheet, Trash2, Wand2, Download, RefreshCw, ListX, Users, Loader2, CheckCircle2 } from 'lucide-react';
import { JobService } from '../../../../../services/jobService';

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
                  console.error("❌ Header fetch failed:", err);
                  alert(`Failed: ${err.message}`);
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
          alert("Upload file first");
          return;
      }

      setIsProcessing(true);
      try {
          console.log('🔄 Processing report...');
          const excludeColsStr = excludeHeaderNames.join(',');
          const result = await JobService.processCustomReport(reportFile, excludeColsStr, reportExcludeInput);
          
          console.log('✅ Report processed:', result);
          setProcessingStats({
              originalRows: result.originalRows || 0,
              finalRows: result.finalRows || 0,
              removedFieldsCount: result.removedFieldsCount || 0
          });
          setProcessedReportData(result.data);
          setIsCustomReportReady(true);
      } catch (err: any) { 
          console.error('❌ Processing failed:', err);
          alert(`Failed: ${err.message}`);
      } finally {
          setIsProcessing(false);
      }
  };

  return (
      <div className="max-w-4xl mx-auto space-y-8">
           <div className="bg-white p-8 rounded-2xl border shadow-sm">
               <div className="flex items-start gap-4 mb-8 border-b pb-6">
                   <div className="bg-purple-600 p-3 rounded-2xl text-white shadow-lg">
                       <Filter size={32}/>
                   </div>
                   <div>
                       <h3 className="font-bold text-2xl text-gray-900">Report Extractor</h3>
                       <p className="text-sm text-gray-500 mt-1">Remove columns & exclude students</p>
                   </div>
               </div>
               
               {!isCustomReportReady ? (
                   <div className="space-y-8">
                       <div className="space-y-3">
                           <label className="text-xs font-bold text-gray-400 uppercase">Step 1: File</label>
                           <div className={`border-2 border-dashed rounded-2xl p-8 text-center ${reportFile ? 'border-purple-500 bg-purple-50/30' : 'border-gray-200'}`}>
                               <input 
                                   type="file" 
                                   className="hidden" 
                                   id="extractorFile" 
                                   accept=".csv,.xlsx,.xls" 
                                   onChange={(e) => {
                                       setReportFile(e.target.files?.[0] || null);
                                       setIsCustomReportReady(false);
                                   }} 
                                   />
                               <label htmlFor="extractorFile" className="cursor-pointer block">
                                   <FileSpreadsheet size={48} className={`mx-auto mb-3 ${reportFile ? 'text-purple-600' : 'text-gray-300'}`} />
                                   <span className="text-base font-bold text-gray-700 block truncate px-4">
                                       {reportFile ? reportFile.name : 'Upload Excel/CSV'}
                                   </span>
                               </label>
                           </div>
                       </div>

                       {reportFile && fileHeaders.length > 0 && (
                           <div className="space-y-4">
                               <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
                                        <ListX size={16} className="text-purple-500" /> Step 2: Remove Columns
                                    </label>
                                    <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded">
                                        {excludeHeaderNames.length} Marked
                                    </span>
                               </div>
                               <div className="flex flex-wrap gap-2 p-5 bg-gray-50 rounded-2xl border max-h-64 overflow-y-auto">
                                   {fileHeaders.map((header, idx) => {
                                       const isExcluded = excludeHeaderNames.includes(header);
                                       return (
                                           <button 
                                               key={`${header}-${idx}`}
                                               onClick={() => toggleHeaderExclusion(header)}
                                               className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-2 ${
                                                   isExcluded 
                                                       ? 'bg-red-500 text-white border-red-500 shadow-md' 
                                                       : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400'
                                               }`}
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
                           <div className="space-y-3">
                               <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
                                   <Users size={16} className="text-purple-500" /> Step 3: Exclude Students
                               </label>
                               <textarea 
                                   className="w-full p-4 border rounded-2xl text-sm font-mono focus:ring-2 focus:ring-purple-100 outline-none resize-none min-h-[120px]" 
                                   placeholder="Roll numbers..." 
                                   value={reportExcludeInput} 
                                   onChange={(e) => { 
                                       setReportExcludeInput(e.target.value); 
                                       setIsCustomReportReady(false); 
                                   }} 
                               />
                               <p className="text-xs text-gray-500 italic">
                                   {reportExcludeInput.split(/[\n,]+/).filter(x => x.trim()).length} excluded
                               </p>
                           </div>
                       )}

                       <button 
                           onClick={handleGenerateCustomReport} 
                           disabled={!reportFile || isProcessing} 
                           className={`w-full py-4 rounded-xl font-bold shadow-xl flex items-center justify-center gap-2 ${
                               !reportFile || isProcessing 
                                   ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                   : 'bg-purple-600 text-white hover:bg-purple-700'
                           }`}
                       >
                           {isProcessing ? <Loader2 size={24} className="animate-spin"/> : <Wand2 size={20}/>}
                           {isProcessing ? 'Processing...' : 'Generate Report'}
                       </button>
                   </div>
               ) : (
                   <div className="space-y-6">
                       <div className="p-8 bg-green-50 border border-green-200 rounded-2xl text-center">
                           <CheckCircle2 size={48} className="text-green-600 mx-auto mb-4" />
                           <h3 className="text-2xl font-bold text-green-900 mb-4">Ready!</h3>
                           <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-8">
                               <div className="bg-white p-4 rounded-xl border shadow-sm">
                                   <span className="block text-2xl font-bold text-gray-800">{processingStats.originalRows}</span>
                                   <span className="text-xs font-bold text-gray-400">INPUT</span>
                               </div>
                               <div className="bg-white p-4 rounded-xl border shadow-sm">
                                   <span className="block text-2xl font-bold text-red-500">{processingStats.removedFieldsCount}</span>
                                   <span className="text-xs font-bold text-gray-400">REMOVED</span>
                               </div>
                               <div className="bg-white p-4 rounded-xl border shadow-sm">
                                   <span className="block text-2xl font-bold text-green-600">{processingStats.finalRows}</span>
                                   <span className="text-xs font-bold text-gray-400">OUTPUT</span>
                               </div>
                           </div>

                           <div className="flex gap-4">
                               {/* INLINE ASYNC HANDLER - Excel */}
                               <button 
                                   onClick={async (e) => {
                                       e.preventDefault();
                                       console.log('🔽 Excel download clicked');
                                       if (!processedReportData) {
                                           alert("No data");
                                           return;
                                       }
                                       try {
                                           console.log('📤 Calling download service...');
                                           await JobService.downloadCustomReport(processedReportData, 'excel');
                                           console.log('✅ Download complete');
                                       } catch (err: any) {
                                           console.error('❌ Download failed:', err);
                                           alert(`Failed: ${err.message}`);
                                       }
                                   }}
                                   className="flex-1 px-6 py-3.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 flex items-center justify-center gap-2 shadow-lg active:scale-95 transition"
                               >
                                   <Download size={20}/> Excel
                               </button>

                               {/* INLINE ASYNC HANDLER - CSV */}
                               <button 
                                   onClick={async (e) => {
                                       e.preventDefault();
                                       console.log('🔽 CSV download clicked');
                                       if (!processedReportData) {
                                           alert("No data");
                                           return;
                                       }
                                       try {
                                           console.log('📤 Calling download service...');
                                           await JobService.downloadCustomReport(processedReportData, 'csv');
                                           console.log('✅ Download complete');
                                       } catch (err: any) {
                                           console.error('❌ Download failed:', err);
                                           alert(`Failed: ${err.message}`);
                                       }
                                   }}
                                   className="flex-1 px-6 py-3.5 bg-white border-2 border-green-600 text-green-700 rounded-xl font-bold hover:bg-green-50 flex items-center justify-center gap-2 active:scale-95 transition"
                               >
                                   <Download size={20}/> CSV
                               </button>
                           </div>
                       </div>

                       {/* INLINE RESET HANDLER */}
                       <button 
                           onClick={(e) => {
                               e.preventDefault();
                               console.log('🔄 Resetting extractor...');
                               setIsCustomReportReady(false); 
                               setReportFile(null); 
                               setFileHeaders([]);
                               setExcludeHeaderNames([]); 
                               setReportExcludeInput(''); 
                               setProcessedReportData(null);
                               setProcessingStats({ originalRows: 0, finalRows: 0, removedFieldsCount: 0 });
                               const fileInput = document.getElementById('extractorFile') as HTMLInputElement;
                               if (fileInput) fileInput.value = '';
                               console.log('✅ Reset complete');
                           }}
                           className="w-full py-3 bg-gray-100 text-gray-600 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 active:scale-95 transition"
                       >
                           <RefreshCw size={16}/> New Extraction
                       </button>
                   </div>
               )}
           </div>
      </div>
  );
};
