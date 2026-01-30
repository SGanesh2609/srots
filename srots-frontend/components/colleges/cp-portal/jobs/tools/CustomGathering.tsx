
import React, { useState } from 'react';
import { StudentService } from '../../../../../services/studentService';
import { User } from '../../../../../types';
import { Download, Users, CheckCircle, AlertCircle, RefreshCw, Database } from 'lucide-react';
import { ALL_PROFILE_FIELDS, COMMON_PROFILE_FIELD_KEYS } from '../../../../../constants';
import { FieldSelector } from '../../../shared/FieldSelector';

export const CustomGathering: React.FC<{ user: User }> = ({ user }) => {
  const [selectedFields, setSelectedFields] = useState<string[]>(['fullName', 'rollNumber', 'branch', 'personalEmail', 'phone']);
  const [rollNumbersInput, setRollNumbersInput] = useState('');
  const [gatheredData, setGatheredData] = useState<any[][] | null>(null);
  const [stats, setStats] = useState<{found: number, notFound: number, notFoundIds: string[]} | null>(null);

  const toggleField = (value: string) => {
      setSelectedFields(prev => prev.includes(value) ? prev.filter(f => f !== value) : [...prev, value]);
  };

  const handleGatherData = async () => {
      if (!rollNumbersInput.trim()) { alert("Please enter Roll Numbers."); return; }
      if (selectedFields.length === 0) { alert("Please select fields."); return; }

      // Call Business Logic
      try {
          const result = await StudentService.generateCustomGatheringReport(user.collegeId || '', rollNumbersInput, selectedFields);

          setGatheredData(result.data);
          setStats({ found: result.foundCount, notFound: result.notFoundIds.length, notFoundIds: result.notFoundIds });
      } catch (error: any) {
          console.error(error);
          alert(error.message || "Failed to gather data");
      }
  };

  const handleDownload = (format: 'csv' | 'xlsx') => {
      if (!gatheredData) return;
      StudentService.downloadGatheredDataReport(gatheredData, format);
  };

  const handleReset = () => {
      setGatheredData(null);
      setStats(null);
      setRollNumbersInput('');
  };

  return (
      <div className="max-w-5xl auto space-y-8 animate-in fade-in slide-in-from-bottom-2">
          <div className="bg-white p-6 rounded-xl border shadow-sm border-blue-100">
              <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-xl text-blue-700"><Database size={32}/></div>
                  <div><h3 className="font-bold text-xl text-gray-900">Custom Data Gathering</h3><p className="text-sm text-gray-500 mt-1">Fetch latest student data by Roll Numbers.</p></div>
              </div>
          </div>

          {!gatheredData ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                      <div className="bg-white p-6 rounded-xl border shadow-sm">
                          <FieldSelector 
                              selectedFields={selectedFields} onToggle={toggleField} options={ALL_PROFILE_FIELDS} commonIds={COMMON_PROFILE_FIELD_KEYS} colorTheme="blue"
                              labels={{ title: <div className="font-bold text-gray-800 flex items-center gap-2"><CheckCircle size={18} className="text-blue-600"/> 1. Select Fields</div> }}
                          />
                      </div>
                  </div>
                  <div className="space-y-6 flex flex-col h-full">
                      <div className="bg-white p-6 rounded-xl border shadow-sm flex-1 flex flex-col">
                          <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Users size={18} className="text-blue-600"/> 2. Enter Students</h4>
                          <textarea className="w-full flex-1 p-4 border rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-100 outline-none resize-none bg-white text-gray-900" placeholder={`20701A0501\n...`} value={rollNumbersInput} onChange={e => setRollNumbersInput(e.target.value)} />
                      </div>
                      <button onClick={handleGatherData} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 flex items-center justify-center gap-2"><Database size={20}/> Gather Student Data</button>
                  </div>
              </div>
          ) : (
              <div className="animate-in fade-in zoom-in duration-300">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center space-y-6">
                      <div className="inline-flex items-center justify-center p-3 bg-green-100 text-green-700 rounded-full mb-2"><CheckCircle size={32} /></div>
                      <h3 className="text-2xl font-bold text-green-900">Data Gathering Complete!</h3>
                      <div className="flex justify-center gap-12 py-4 border-t border-b border-green-200/50">
                          <div className="text-center"><p className="text-4xl font-extrabold text-green-600">{stats?.found}</p><p className="text-xs font-bold text-green-800 uppercase">Students Found</p></div>
                          {stats && stats.notFound > 0 && (<div className="text-center"><p className="text-4xl font-extrabold text-orange-500">{stats.notFound}</p><p className="text-xs font-bold text-orange-700 uppercase">Not Found</p></div>)}
                      </div>
                      {stats && stats.notFoundIds.length > 0 && (<div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-left max-w-2xl mx-auto"><h5 className="text-orange-800 font-bold text-sm flex items-center gap-2 mb-2"><AlertCircle size={16}/> Not Found IDs:</h5><div className="text-xs text-orange-700 font-mono break-all">{stats.notFoundIds.join(', ')}</div></div>)}
                      <div className="max-w-md mx-auto space-y-3 pt-4">
                          <div className="flex gap-3">
                              <button onClick={() => handleDownload('xlsx')} className="flex-1 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 shadow-md flex items-center justify-center gap-2"><Download size={18}/> Excel</button>
                              <button onClick={() => handleDownload('csv')} className="flex-1 py-3 bg-white border-2 border-green-600 text-green-700 rounded-lg font-bold hover:bg-green-50 shadow-sm flex items-center justify-center gap-2"><Download size={18}/> CSV</button>
                          </div>
                          <button onClick={handleReset} className="w-full py-3 text-gray-500 font-bold text-sm hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center gap-2"><RefreshCw size={16}/> Start New Gathering</button>
                      </div>
                  </div>
              </div>
          )}
      </div>
  );
};
