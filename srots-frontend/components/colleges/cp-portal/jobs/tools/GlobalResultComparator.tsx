
import React, { useState } from 'react';
import { FileDiff, FileText, CheckCircle, FileSpreadsheet, Download, RefreshCw } from 'lucide-react';
import { JobService } from '../../../../../services/jobService';

export const GlobalResultComparator: React.FC = () => {
  const [compareMasterFile, setCompareMasterFile] = useState<File | null>(null);
  const [compareResultFile, setCompareResultFile] = useState<File | null>(null);
  const [isResultantFileReady, setIsResultantFileReady] = useState(false);
  const [comparisonStats, setComparisonStats] = useState<{passed: number, failed: number} | null>(null);
  const [processedResultData, setProcessedResultData] = useState<any[][] | null>(null);

  const handleCompareFiles = async () => {
      if (!compareMasterFile || !compareResultFile) {
          alert("Please upload both Master List and Latest Result File.");
          return;
      }

      try {
          // Call Business Logic (Backend handles file parsing)
          const result = await JobService.compareResultFiles(compareMasterFile, compareResultFile);

          setComparisonStats({ passed: result.passed, failed: result.failed });
          setProcessedResultData(result.data);
          setIsResultantFileReady(true);

      } catch (error: any) {
          console.error(error);
          alert("Error processing files: " + error.message);
      }
  };

  const handleDownload = (format: 'csv' | 'xlsx') => {
      if (!processedResultData) return;
      JobService.downloadComparisonReport(processedResultData, format);
  };

  const handleReset = () => {
      setIsResultantFileReady(false);
      setCompareMasterFile(null);
      setCompareResultFile(null);
      setProcessedResultData(null);
      setComparisonStats(null);
  };

  return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2">
           <div className="bg-white p-8 rounded-xl border shadow-sm border-blue-200">
               <div className="flex items-start gap-4 mb-6">
                   <div className="bg-blue-100 p-3 rounded-xl text-blue-700"><FileDiff size={32}/></div>
                   <div>
                       <h3 className="font-bold text-xl text-gray-900">Global Result Comparator</h3>
                       <p className="text-sm text-gray-500 mt-1 max-w-2xl">Compare a Master List (e.g., Applicants) with a Latest Result File.</p>
                   </div>
               </div>
               
               {!isResultantFileReady ? (
                   <>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                           <div className="space-y-2">
                               <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Step 1: Master File</label>
                               <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${compareMasterFile ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-blue-300'}`}>
                                   <input type="file" className="hidden" id="masterFile" accept=".csv, .xlsx, .xls" onChange={(e) => setCompareMasterFile(e.target.files?.[0] || null)} />
                                   <label htmlFor="masterFile" className="cursor-pointer block">
                                       <FileText size={24} className={`mx-auto mb-2 ${compareMasterFile ? 'text-green-600' : 'text-gray-400'}`} />
                                       <span className="text-sm font-bold text-gray-700 block truncate">{compareMasterFile ? compareMasterFile.name : 'Upload Master List'}</span>
                                   </label>
                               </div>
                           </div>
                           <div className="space-y-2">
                               <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Step 2: Result File</label>
                               <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${compareResultFile ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-blue-300'}`}>
                                   <input type="file" className="hidden" id="resultFile" accept=".csv, .xlsx, .xls" onChange={(e) => setCompareResultFile(e.target.files?.[0] || null)} />
                                   <label htmlFor="resultFile" className="cursor-pointer block">
                                       <FileText size={24} className={`mx-auto mb-2 ${compareResultFile ? 'text-green-600' : 'text-gray-400'}`} />
                                       <span className="text-sm font-bold text-gray-700 block truncate">{compareResultFile ? compareResultFile.name : 'Upload Result File'}</span>
                                   </label>
                               </div>
                           </div>
                       </div>

                       <button 
                           onClick={handleCompareFiles} 
                           disabled={!compareMasterFile || !compareResultFile}
                           className={`w-full py-3 rounded-lg font-bold text-sm shadow-md transition-all ${(!compareMasterFile || !compareResultFile) ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                       >
                           Compare Result Files
                       </button>
                   </>
               ) : (
                   <div className="animate-in fade-in slide-in-from-top-2 duration-300 bg-green-50 border border-green-200 rounded-xl p-6 text-center space-y-6">
                       <div className="flex items-center justify-center gap-2 text-green-700 font-bold text-lg">
                           <CheckCircle size={24} /> Comparison Successful
                       </div>
                       
                       <div className="flex justify-center gap-8 text-sm">
                           <div className="flex flex-col"><span className="text-3xl font-bold text-green-600">{comparisonStats?.passed}</span><span className="text-gray-500 font-bold uppercase text-[10px]">Passed</span></div>
                           <div className="flex flex-col"><span className="text-3xl font-bold text-red-500">{comparisonStats?.failed}</span><span className="text-gray-500 font-bold uppercase text-[10px]">Failed</span></div>
                       </div>

                       <div className="flex flex-col sm:flex-row gap-3 justify-center">
                           <button onClick={() => handleDownload('xlsx')} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 flex items-center justify-center gap-2 shadow-sm"><Download size={16}/> Excel (.xlsx)</button>
                           <button onClick={() => handleDownload('csv')} className="px-4 py-2 bg-white border border-green-600 text-green-700 rounded-lg text-sm font-bold hover:bg-green-50 flex items-center justify-center gap-2 shadow-sm"><Download size={16}/> CSV (.csv)</button>
                       </div>

                       <div className="pt-4 border-t border-green-200">
                           <button onClick={handleReset} className="mx-auto flex items-center gap-2 text-gray-500 font-bold text-sm hover:text-gray-800 transition-colors bg-white px-4 py-2 rounded-lg border hover:bg-gray-50 shadow-sm"><RefreshCw size={14}/> Start New Comparison</button>
                       </div>
                   </div>
               )}
           </div>
      </div>
  );
};
