import React, { useState, useEffect } from 'react';
import { User } from '../../../../../types';
import { Download, Users, CheckCircle, AlertCircle, RefreshCw, Database, Loader2, Search } from 'lucide-react';
import { JobService } from '../../../../../services/jobService';

/**
 * Component: CustomGathering
 * SYNCED WITH: PlacementToolsController.java - /api/v1/tools/gather/*
 * 
 * UPDATED: Backend now provides expanded education fields:
 * - 10th_marks, 10th_cgpa, 10th_percentage
 * - 12th_marks, 12th_cgpa, 12th_percentage
 * - diploma_marks, diploma_cgpa, diploma_percentage
 * - btech_marks, btech_cgpa, btech_percentage
 * - mtech_marks, mtech_cgpa, mtech_percentage
 * 
 * FIXES:
 * - Download buttons now properly await async calls
 * - Reset button clears all state including file input
 * - Search field filters available fields
 */

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

  // Fetch available fields from backend
  useEffect(() => {
      const fetchFields = async () => {
          try {
              const fields = await JobService.getGatheringFields();
              setAvailableFields(fields);
          } catch (err) {
              console.error('Failed to load available fields:', err);
              alert('Failed to load field list. Please refresh the page.');
          }
      };
      fetchFields();
  }, []);

  const toggleField = (value: string) => {
      setSelectedFields(prev => 
          prev.includes(value) 
              ? prev.filter(f => f !== value) 
              : [...prev, value]
      );
  };

  const handleGatherData = async () => {
      if (!rollNumbersInput.trim()) { 
          alert("Please enter at least one Roll Number."); 
          return; 
      }
      if (selectedFields.length === 0) { 
          alert("Please select at least one field to extract."); 
          return; 
      }

      setIsProcessing(true);
      try {
          const result = await JobService.generateCustomGatheringReport(
              user.collegeId || '', 
              rollNumbersInput, 
              selectedFields
          );

          setGatheredData(result.data);
          setStats({ 
              found: (result.data?.length || 1) - 1, // Subtract header row
              notFound: result.unknownRollNumbers?.length || 0, 
              notFoundIds: result.unknownRollNumbers || [],
              unknownFields: result.unknownFields || []
          });
      } catch (err: any) {
          console.error("Gathering error:", err);
          const errorMsg = err.response?.data?.message || err.message || "Data gathering failed";
          alert(`Error gathering student data: ${errorMsg}`);
      } finally {
          setIsProcessing(false);
      }
  };

  const handleDownload = async (format: 'csv' | 'xlsx') => {
      if (!gatheredData) {
          alert("No data to download");
          return;
      }
      try {
          // FIXED: Properly await the download
          await JobService.downloadGatheredDataReport(gatheredData, format === 'csv' ? 'csv' : 'excel');
      } catch (err) {
          console.error("Download error:", err);
          alert("Download failed. Please try again.");
      }
  };

  const handleReset = () => {
      // FIXED: Clear ALL state
      setGatheredData(null);
      setStats(null);
      setRollNumbersInput('');
      setSearchField('');
  };

  // Filter fields based on search
  const filteredFieldGroups = Object.entries(availableFields).map(([group, fields]) => ({
      group,
      fields: fields.filter(f => f.toLowerCase().includes(searchField.toLowerCase()))
  })).filter(g => g.fields.length > 0);

  const rollNumberCount = rollNumbersInput.split(/[\n,]+/).filter(r => r.trim()).length;

  return (
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2">
          <div className="bg-white p-6 rounded-xl border shadow-sm border-blue-100">
              <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-xl text-blue-700"><Database size={32}/></div>
                  <div>
                      <h3 className="font-bold text-xl text-gray-900">Custom Data Gathering</h3>
                      <p className="text-sm text-gray-500 mt-1">
                          Fetch latest student data by Roll Numbers from the institutional database.
                      </p>
                      <p className="text-xs text-blue-600 mt-1 font-medium">
                          ✓ Includes expanded education fields (10th/12th/Diploma/BTech/MTech in Marks/CGPA/Percentage)
                      </p>
                  </div>
              </div>
          </div>

          {!gatheredData ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Field Selector */}
                  <div className="space-y-6">
                      <div className="bg-white p-6 rounded-xl border shadow-sm">
                          <div className="flex items-center justify-between mb-4">
                              <h4 className="font-bold text-gray-800 flex items-center gap-2">
                                  <CheckCircle size={18} className="text-blue-600"/> 1. Select Fields to Extract
                              </h4>
                              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                                  {selectedFields.length} Selected
                              </span>
                          </div>

                          {/* Search */}
                          <div className="relative mb-4">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                              <input 
                                  type="text"
                                  placeholder="Search fields..."
                                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                                  value={searchField}
                                  onChange={(e) => setSearchField(e.target.value)}
                              />
                          </div>

                          {/* Field Groups */}
                          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                              {filteredFieldGroups.length === 0 ? (
                                  <div className="text-center py-8 text-gray-400">
                                      <Search size={32} className="mx-auto mb-2 opacity-50" />
                                      <p className="text-sm">No fields match your search</p>
                                  </div>
                              ) : (
                                  filteredFieldGroups.map(({group, fields}) => (
                                      <div key={group} className="border-b pb-3 last:border-b-0">
                                          <h5 className="text-xs font-bold text-gray-500 uppercase mb-2">{group}</h5>
                                          <div className="flex flex-wrap gap-2">
                                              {fields.map(field => {
                                                  const isSelected = selectedFields.includes(field);
                                                  const isEducationExpanded = field.includes('_'); // Highlight expanded fields
                                                  
                                                  return (
                                                      <button
                                                          key={field}
                                                          onClick={() => toggleField(field)}
                                                          className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                                                              isSelected
                                                                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                                                  : isEducationExpanded
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

                  {/* Roll Number Input */}
                  <div className="space-y-6 flex flex-col h-full">
                      <div className="bg-white p-6 rounded-xl border shadow-sm flex-1 flex flex-col">
                          <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                              <Users size={18} className="text-blue-600"/> 2. Enter Roll Numbers
                          </h4>
                          <textarea 
                              disabled={isProcessing}
                              className="w-full flex-1 p-4 border rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-100 outline-none resize-none bg-white text-gray-900 disabled:bg-gray-50 min-h-[200px]" 
                              placeholder={`20701A0501\n20701A0502\n20701A0503`} 
                              value={rollNumbersInput} 
                              onChange={e => setRollNumbersInput(e.target.value)} 
                          />
                          <div className="mt-2 flex justify-between items-center">
                              <p className="text-xs text-gray-400">
                                  Enter one roll number per line or comma-separated
                              </p>
                              <p className="text-xs font-bold text-blue-600">
                                  {rollNumberCount} {rollNumberCount === 1 ? 'student' : 'students'}
                              </p>
                          </div>
                      </div>
                      <button 
                        onClick={handleGatherData} 
                        disabled={isProcessing || selectedFields.length === 0 || !rollNumbersInput.trim()}
                        className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all active:scale-95"
                      >
                          {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <Database size={20}/>} 
                          {isProcessing ? 'Gathering Data...' : 'Gather Student Data'}
                      </button>
                  </div>
              </div>
          ) : (
              <div className="animate-in fade-in zoom-in duration-300">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center space-y-6">
                      <div className="inline-flex items-center justify-center p-3 bg-green-100 text-green-700 rounded-full mb-2">
                          <CheckCircle size={32} />
                      </div>
                      <h3 className="text-2xl font-bold text-green-900">Data Gathering Complete!</h3>
                      
                      <div className="flex justify-center gap-12 py-4 border-t border-b border-green-200/50">
                          <div className="text-center">
                              <p className="text-4xl font-extrabold text-green-600">{stats?.found || 0}</p>
                              <p className="text-xs font-bold text-green-800 uppercase">Students Found</p>
                          </div>
                          {stats && stats.notFound > 0 && (
                              <div className="text-center">
                                  <p className="text-4xl font-extrabold text-orange-500">{stats.notFound}</p>
                                  <p className="text-xs font-bold text-orange-700 uppercase">Not Found</p>
                              </div>
                          )}
                      </div>

                      {/* Not Found IDs */}
                      {stats && stats.notFoundIds.length > 0 && (
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-left max-w-2xl mx-auto">
                              <h5 className="text-orange-800 font-bold text-sm flex items-center gap-2 mb-2">
                                  <AlertCircle size={16}/> Not Found Roll Numbers:
                              </h5>
                              <div className="text-xs text-orange-700 font-mono break-all">
                                  {stats.notFoundIds.join(', ')}
                              </div>
                          </div>
                      )}

                      {/* Unknown Fields */}
                      {stats && stats.unknownFields.length > 0 && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left max-w-2xl mx-auto">
                              <h5 className="text-yellow-800 font-bold text-sm flex items-center gap-2 mb-2">
                                  <AlertCircle size={16}/> Unknown Fields (Excluded from export):
                              </h5>
                              <div className="text-xs text-yellow-700 font-mono break-all">
                                  {stats.unknownFields.join(', ')}
                              </div>
                          </div>
                      )}

                      <div className="max-w-md mx-auto space-y-3 pt-4">
                          <div className="flex gap-3">
                              <button 
                                  onClick={() => handleDownload('xlsx')} 
                                  className="flex-1 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
                              >
                                  <Download size={18}/> Excel
                              </button>
                              <button 
                                  onClick={() => handleDownload('csv')} 
                                  className="flex-1 py-3 bg-white border-2 border-green-600 text-green-700 rounded-lg font-bold hover:bg-green-50 shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95"
                              >
                                  <Download size={18}/> CSV
                              </button>
                          </div>
                          <button 
                              onClick={handleReset} 
                              className="w-full py-3 text-gray-500 font-bold text-sm hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center gap-2 active:scale-95"
                          >
                              <RefreshCw size={16}/> Start New Gathering
                          </button>
                      </div>
                  </div>
              </div>
          )}
      </div>
  );
};
