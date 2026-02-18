import React, { useState, useEffect } from 'react';
import { User } from '../../../../../types';
import { Download, Users, CheckCircle, AlertCircle, RefreshCw, Database, Loader2, Search } from 'lucide-react';
import { JobService } from '../../../../../services/jobService';

export const CustomGathering: React.FC<{ user: User }> = ({ user }) => {
  const [availableFields, setAvailableFields] = useState<Record<string, string[]>>({});
  const [selectedFields, setSelectedFields] = useState<string[]>(['fullName', 'rollNumber', 'branch', 'personalEmail', 'phone']);
  const [rollNumbersInput, setRollNumbersInput] = useState('');
  const [gatheredData, setGatheredData] = useState<any[][] | null>(null);
  const [stats, setStats] = useState<{
      found: number, 
      notFound: number, 
      notFoundIds: string[], 
      unknownFields: string[]
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchField, setSearchField] = useState('');

  useEffect(() => {
      const fetchFields = async () => {
          try {
              const fields = await JobService.getGatheringFields();
              setAvailableFields(fields);
          } catch (err) {
              console.error('❌ Failed to load fields:', err);
              alert('Failed to load fields');
          }
      };
      fetchFields();
  }, []);

  const toggleField = (value: string) => {
      setSelectedFields(prev => 
          prev.includes(value) ? prev.filter(f => f !== value) : [...prev, value]
      );
  };

  const handleGatherData = async () => {
      if (!rollNumbersInput.trim()) { 
          alert("Enter roll numbers"); 
          return; 
      }
      if (selectedFields.length === 0) { 
          alert("Select fields"); 
          return; 
      }

      setIsProcessing(true);
      try {
          console.log('🔄 Gathering data...');
          const result = await JobService.generateCustomGatheringReport(
              user.collegeId || '', 
              rollNumbersInput, 
              selectedFields
          );

          console.log('✅ Data gathered:', result);
          setGatheredData(result.data);
          setStats({ 
              found: (result.data?.length || 1) - 1,
              notFound: result.unknownRollNumbers?.length || 0, 
              notFoundIds: result.unknownRollNumbers || [],
              unknownFields: result.unknownFields || []
          });
      } catch (err: any) {
          console.error('❌ Gathering failed:', err);
          alert(`Failed: ${err.message}`);
      } finally {
          setIsProcessing(false);
      }
  };

  const filteredFieldGroups = Object.entries(availableFields).map(([group, fields]) => ({
      group,
      fields: fields.filter(f => f.toLowerCase().includes(searchField.toLowerCase()))
  })).filter(g => g.fields.length > 0);

  const rollNumberCount = rollNumbersInput.split(/[\n,]+/).filter(r => r.trim()).length;

  return (
      <div className="max-w-5xl mx-auto space-y-8">
          <div className="bg-white p-6 rounded-xl border shadow-sm">
              <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-xl text-blue-700">
                      <Database size={32}/>
                  </div>
                  <div>
                      <h3 className="font-bold text-xl text-gray-900">Custom Gathering</h3>
                      <p className="text-sm text-gray-500 mt-1">Fetch student data by roll numbers</p>
                      <p className="text-xs text-blue-600 mt-1">
                          ✓ Includes expanded education fields
                      </p>
                  </div>
              </div>
          </div>

          {!gatheredData ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                      <div className="bg-white p-6 rounded-xl border shadow-sm">
                          <div className="flex items-center justify-between mb-4">
                              <h4 className="font-bold text-gray-800 flex items-center gap-2">
                                  <CheckCircle size={18} className="text-blue-600"/> 1. Select Fields
                              </h4>
                              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                  {selectedFields.length} Selected
                              </span>
                          </div>

                          <div className="relative mb-4">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                              <input 
                                  type="text"
                                  placeholder="Search..."
                                  className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                                  value={searchField}
                                  onChange={(e) => setSearchField(e.target.value)}
                              />
                          </div>

                          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                              {filteredFieldGroups.length === 0 ? (
                                  <div className="text-center py-8 text-gray-400">
                                      <Search size={32} className="mx-auto mb-2 opacity-50" />
                                      <p className="text-sm">No fields match</p>
                                  </div>
                              ) : (
                                  filteredFieldGroups.map(({group, fields}) => (
                                      <div key={group} className="border-b pb-3 last:border-b-0">
                                          <h5 className="text-xs font-bold text-gray-500 uppercase mb-2">{group}</h5>
                                          <div className="flex flex-wrap gap-2">
                                              {fields.map(field => {
                                                  const isSelected = selectedFields.includes(field);
                                                  const isExpanded = field.includes('_');
                                                  
                                                  return (
                                                      <button
                                                          key={field}
                                                          onClick={() => toggleField(field)}
                                                          className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${
                                                              isSelected
                                                                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                                                  : isExpanded
                                                                      ? 'bg-green-50 text-green-700 border-green-200 hover:border-green-400'
                                                                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                                                          }`}
                                                      >
                                                          {field}
                                                      </button>
                                                  );
                                              })}
                                          </div>
                                      </div>
                                  ))
                              )}
                          </div>
                      </div>
                  </div>

                  <div className="space-y-6 flex flex-col">
                      <div className="bg-white p-6 rounded-xl border shadow-sm flex-1 flex flex-col">
                          <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                              <Users size={18} className="text-blue-600"/> 2. Roll Numbers
                          </h4>
                          <textarea 
                              disabled={isProcessing}
                              className="w-full flex-1 p-4 border rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-100 outline-none resize-none disabled:bg-gray-50 min-h-[200px]" 
                              placeholder="20701A0501&#10;20701A0502" 
                              value={rollNumbersInput} 
                              onChange={e => setRollNumbersInput(e.target.value)} 
                          />
                          <div className="mt-2 flex justify-between items-center">
                              <p className="text-xs text-gray-400">One per line</p>
                              <p className="text-xs font-bold text-blue-600">{rollNumberCount} students</p>
                          </div>
                      </div>
                      <button 
                        onClick={handleGatherData} 
                        disabled={isProcessing || selectedFields.length === 0 || !rollNumbersInput.trim()}
                        className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed active:scale-95 transition"
                      >
                          {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <Database size={20}/>} 
                          {isProcessing ? 'Gathering...' : 'Gather Data'}
                      </button>
                  </div>
              </div>
          ) : (
              <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center space-y-6">
                  <CheckCircle size={48} className="text-green-600 mx-auto" />
                  <h3 className="text-2xl font-bold text-green-900">Complete!</h3>
                  
                  <div className="flex justify-center gap-12 py-4 border-t border-b border-green-200/50">
                      <div>
                          <p className="text-4xl font-bold text-green-600">{stats?.found || 0}</p>
                          <p className="text-xs font-bold text-green-800">FOUND</p>
                      </div>
                      {stats && stats.notFound > 0 && (
                          <div>
                              <p className="text-4xl font-bold text-orange-500">{stats.notFound}</p>
                              <p className="text-xs font-bold text-orange-700">NOT FOUND</p>
                          </div>
                      )}
                  </div>

                  {stats && stats.notFoundIds.length > 0 && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-left max-w-2xl mx-auto">
                          <h5 className="text-orange-800 font-bold text-sm flex items-center gap-2 mb-2">
                              <AlertCircle size={16}/> Not Found:
                          </h5>
                          <div className="text-xs text-orange-700 font-mono break-all">
                              {stats.notFoundIds.join(', ')}
                          </div>
                      </div>
                  )}

                  <div className="max-w-md mx-auto space-y-3 pt-4">
                      <div className="flex gap-3">
                          {/* INLINE ASYNC HANDLER - Excel */}
                          <button 
                              onClick={async (e) => {
                                  e.preventDefault();
                                  console.log('🔽 Excel download clicked');
                                  if (!gatheredData) {
                                      alert("No data");
                                      return;
                                  }
                                  try {
                                      console.log('📤 Calling download service...');
                                      await JobService.downloadGatheredDataReport(gatheredData, 'excel');
                                      console.log('✅ Download complete');
                                  } catch (err: any) {
                                      console.error('❌ Download failed:', err);
                                      alert(`Failed: ${err.message}`);
                                  }
                              }}
                              className="flex-1 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 shadow-md flex items-center justify-center gap-2 active:scale-95 transition"
                          >
                              <Download size={18}/> Excel
                          </button>

                          {/* INLINE ASYNC HANDLER - CSV */}
                          <button 
                              onClick={async (e) => {
                                  e.preventDefault();
                                  console.log('🔽 CSV download clicked');
                                  if (!gatheredData) {
                                      alert("No data");
                                      return;
                                  }
                                  try {
                                      console.log('📤 Calling download service...');
                                      await JobService.downloadGatheredDataReport(gatheredData, 'csv');
                                      console.log('✅ Download complete');
                                  } catch (err: any) {
                                      console.error('❌ Download failed:', err);
                                      alert(`Failed: ${err.message}`);
                                  }
                              }}
                              className="flex-1 py-3 bg-white border-2 border-green-600 text-green-700 rounded-lg font-bold hover:bg-green-50 flex items-center justify-center gap-2 active:scale-95 transition"
                          >
                              <Download size={18}/> CSV
                          </button>
                      </div>

                      {/* INLINE RESET HANDLER */}
                      <button 
                          onClick={(e) => {
                              e.preventDefault();
                              console.log('🔄 Resetting gathering...');
                              setGatheredData(null);
                              setStats(null);
                              setRollNumbersInput('');
                              setSearchField('');
                              console.log('✅ Reset complete');
                          }}
                          className="w-full py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-lg flex items-center justify-center gap-2 active:scale-95 transition"
                      >
                          <RefreshCw size={16}/> New Gathering
                      </button>
                  </div>
              </div>
          )}
      </div>
  );
};
