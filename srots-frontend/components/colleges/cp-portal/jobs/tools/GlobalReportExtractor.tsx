
import React, { useState } from 'react';
import { Filter, FileSpreadsheet, Trash2, Wand2, FileCheck, Download, RefreshCw } from 'lucide-react';
import { FieldSelector, FieldOption } from '../../../shared/FieldSelector';
import { ALL_PROFILE_FIELDS, COMMON_PROFILE_FIELD_KEYS } from '../../../../../constants';
import { StudentService } from '../../../../../services/studentService';

export const GlobalReportExtractor: React.FC = () => {
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [reportExcludeInput, setReportExcludeInput] = useState('');
  const [reportColumnsToExclude, setReportColumnsToExclude] = useState<string[]>([]);
  const [isCustomReportReady, setIsCustomReportReady] = useState(false);
  const [processingStats, setProcessingStats] = useState({ originalRows: 0, finalRows: 0, removedCols: 0 });
  const [processedReportData, setProcessedReportData] = useState<any[][] | null>(null);

  const extendedOptions: FieldOption[] = [
      ...ALL_PROFILE_FIELDS,
      { value: 'backlogs', label: 'Backlogs / Arrears', category: 'Academic' }
  ];

  const handleGenerateCustomReport = async () => {
      if (!reportFile) { alert("Please upload the Master Data File (Excel) first."); return; }

      try {
          // Call Business Logic in Service (Backend handles file parsing)
          const result = await StudentService.processCustomReport(reportFile, reportColumnsToExclude, reportExcludeInput);

          setProcessingStats({
              originalRows: result.originalRows,
              finalRows: result.finalRows,
              removedCols: result.removedCols
          });
          setProcessedReportData(result.data);
          setIsCustomReportReady(true);
      } catch (err: any) { 
          console.error(err); 
          alert("Error processing file: " + err.message); 
      }
  };

  const handleDownload = (format: 'csv' | 'xlsx') => {
      if (!processedReportData) return;
      StudentService.downloadCustomReport(processedReportData, format);
  };

  const handleReset = () => {
      setIsCustomReportReady(false); setReportFile(null); setReportColumnsToExclude([]); setReportExcludeInput(''); setProcessedReportData(null);
  };

  const toggleColumn = (col: string) => {
      setIsCustomReportReady(false);
      setReportColumnsToExclude(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]);
  };

  return (
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2">
           <div className="bg-white p-8 rounded-xl border shadow-sm">
               <div className="border-b pb-6 mb-6">
                   <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2"><Filter size={24} className="text-purple-600"/> Custom Report Extractor</h3>
                   <p className="text-sm text-gray-500 mt-2">Clean your master data by removing sensitive columns and excluding specific students.</p>
               </div>
               
               {!isCustomReportReady ? (
                   <>
                       <div className="mb-8">
                           <label className="text-sm font-bold text-gray-800 block mb-2">1. Upload Source File (Full Data)</label>
                           <div className="flex items-center gap-4">
                               <label className="flex-1 cursor-pointer">
                                   <div className={`border-2 border-dashed rounded-lg p-4 flex items-center justify-center gap-3 transition-colors ${reportFile ? 'border-purple-300 bg-purple-50' : 'border-gray-300 hover:bg-gray-50'}`}>
                                       <FileSpreadsheet size={24} className="text-gray-400" />
                                       <span className="text-sm font-medium text-gray-600">{reportFile ? reportFile.name : 'Choose Excel/CSV File'}</span>
                                       <input type="file" className="hidden" accept=".csv, .xlsx, .xls" onChange={(e) => { setReportFile(e.target.files?.[0] || null); setIsCustomReportReady(false); }} />
                                   </div>
                               </label>
                               {reportFile && <button onClick={() => { setReportFile(null); setIsCustomReportReady(false); }} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={20}/></button>}
                           </div>
                       </div>

                       <div className="mb-8">
                           <FieldSelector 
                               selectedFields={reportColumnsToExclude} onToggle={toggleColumn} options={extendedOptions} commonIds={COMMON_PROFILE_FIELD_KEYS} colorTheme="red"
                               labels={{ title: '2. Filter Columns', commonSection: 'Common Fields', searchSection: 'Search Fields to Remove', selectedSection: 'Columns to Remove' }}
                           />
                       </div>

                       <div className="mb-8">
                           <label className="text-sm font-bold text-gray-800 block mb-2">3. Exclude Students (Remove Rows)</label>
                           <textarea className="w-full p-3 border rounded-lg text-sm h-24 font-mono focus:ring-2 focus:ring-purple-100 outline-none resize-none bg-white text-gray-900" placeholder="Enter Roll Numbers to remove..." value={reportExcludeInput} onChange={(e) => { setReportExcludeInput(e.target.value); setIsCustomReportReady(false); }} />
                       </div>

                       <div className="border-t pt-6">
                           <button onClick={handleGenerateCustomReport} disabled={!reportFile} className={`w-full py-3 rounded-lg font-bold shadow-md flex items-center justify-center gap-2 transition-all ${!reportFile ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700'}`}>
                               <Wand2 size={18}/> Generate Filtered Report
                           </button>
                       </div>
                   </>
               ) : (
                   <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                       <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-center">
                           <div className="flex items-center justify-center gap-3 mb-4"><FileCheck size={24} className="text-purple-600"/><p className="font-bold text-gray-800 text-lg">Report Ready</p></div>
                           <div className="grid grid-cols-3 gap-2 text-center text-xs border-t border-b border-purple-200 py-3 mb-4 bg-white/50 rounded-lg">
                               <div><span className="block font-bold text-gray-800 text-lg">{processingStats.originalRows}</span><span className="text-gray-500">Original Rows</span></div>
                               <div><span className="block font-bold text-red-600 text-lg">{processingStats.removedCols}</span><span className="text-gray-500">Cols Removed</span></div>
                               <div><span className="block font-bold text-green-600 text-lg">{processingStats.finalRows}</span><span className="text-gray-500">Final Rows</span></div>
                           </div>
                           <div className="flex flex-col sm:flex-row gap-3 justify-center">
                               <button onClick={() => handleDownload('xlsx')} className="px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 shadow-md flex items-center justify-center gap-2 flex-1"><Download size={16}/> Excel (.xlsx)</button>
                               <button onClick={() => handleDownload('csv')} className="px-5 py-2.5 bg-white border border-green-600 text-green-700 rounded-lg text-sm font-bold hover:bg-green-50 shadow-md flex items-center justify-center gap-2 flex-1"><Download size={16}/> CSV (.csv)</button>
                           </div>
                       </div>
                       <button onClick={handleReset} className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors border border-gray-300"><RefreshCw size={16}/> Process Another File</button>
                   </div>
               )}
           </div>
      </div>
  );
};
