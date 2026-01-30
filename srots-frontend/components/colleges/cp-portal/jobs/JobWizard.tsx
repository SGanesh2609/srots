
import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Trash2, FileText, Search, 
  ChevronLeft, ChevronRight, 
  CheckCircle, UploadCloud, Loader2
} from 'lucide-react';
import { Job, User, MarkFormat } from '../../../../types';
import { CollegeService } from '../../../../services/collegeService';
import { CompanyService } from '../../../../services/companyService';
import { ALL_PROFILE_FIELDS, AVAILABLE_BATCHES, COMMON_PROFILE_FIELD_KEYS } from '../../../../constants';
import { FieldSelector } from '../../shared/FieldSelector';

interface JobWizardProps {
  isOpen: boolean;
  isEditing: boolean;
  initialData?: Job | null; 
  user?: User;
  onClose: () => void;
  onSave: (jobData: Partial<Job>) => void;
}

const currentYear = new Date().getFullYear();

export const JobWizard: React.FC<JobWizardProps> = ({ 
  isOpen, 
  isEditing, 
  initialData, 
  user,
  onClose, 
  onSave 
}) => {
  const [step, setStep] = useState(1);
  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});
  const [branchSearch, setBranchSearch] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  const jobDocInputRef = useRef<HTMLInputElement>(null);
  const [collegeBranches, setCollegeBranches] = useState<string[]>([]);

  const initialFormState: Partial<Job> = {
    title: '', summary: '', type: 'Full-Time', location: '', workArrangement: 'On-site', salaryRange: '',
    internalId: '', companyCulture: '', physicalDemands: '', eeoStatement: '', hiringDepartment: '',
    responsibilities: [''], qualifications: [''], preferredQualifications: [''],
    eligibility: { 
        minCGPA: 0, 
        maxBacklogs: 0, 
        allowedBranches: [], 
        min10th: 60, 
        format10th: 'Percentage',
        min12th: 60, 
        format12th: 'Percentage',
        batch: currentYear, 
        eligibleBatches: [], 
        isDiplomaEligible: false,
        minDiploma: 60, 
        formatDiploma: 'Percentage',
        educationalGapsAllowed: false,
        maxGapYears: 0
    },
    rounds: [], 
    requiredStudentFields: COMMON_PROFILE_FIELD_KEYS, 
    documents: [], benefits: [''], applicationDeadline: '', negativeList: []
  };

  const [newJob, setNewJob] = useState<Partial<Job>>(initialFormState);

  useEffect(() => {
    if (isOpen) {
      if (isEditing && initialData) {
        setNewJob(JSON.parse(JSON.stringify(initialData)));
      } else {
        setNewJob(JSON.parse(JSON.stringify(initialFormState)));
      }
      setStep(1);
      setFormErrors({});
      
      if (user?.collegeId) {
          const fetchCollege = async () => {
              const col = await CollegeService.getCollegeById(user.collegeId!);
              const codes = col?.branches?.map(b => b.code) || [];
              setCollegeBranches(codes);
          };
          fetchCollege();
      }
    }
  }, [isOpen, isEditing, initialData, user?.collegeId]);

  if (!isOpen) return null;

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        setIsUploading(true);
        try {
            const file = e.target.files[0];
            const url = await CompanyService.uploadFile(file);
            const newDoc = { name: file.name, url: url }; 
            setNewJob({ ...newJob, documents: [...(newJob.documents || []), newDoc] });
        } catch (err) {
            alert("Failed to upload document");
        } finally {
            setIsUploading(false);
        }
    }
  };

  const removeDocument = (index: number) => {
    const docs = [...(newJob.documents || [])];
    docs.splice(index, 1);
    setNewJob({ ...newJob, documents: docs });
  };

  const validateStep = () => {
      const errors: Record<string, boolean> = {};
      if (step === 1) {
        if (!newJob.title) errors.title = true;
        if (!newJob.company) errors.company = true;
        if (!newJob.location) errors.location = true;
        if (!newJob.summary) errors.summary = true;
      }
      if (step === 4) {
        if (!newJob.applicationDeadline) errors.applicationDeadline = true;
      }
      setFormErrors(errors);
      return Object.keys(errors).length === 0;
  };

  const handleNext = () => { if (validateStep()) setStep(s => s + 1); };
  const handleFinalSave = () => { if (validateStep()) onSave(newJob); };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in duration-200">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b bg-gray-50 flex justify-between items-center rounded-t-xl">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">{isEditing ? 'Edit Job Posting' : 'Post New Job Opportunity'}</h2>
                    <div className="flex items-center gap-2 mt-1">
                        {[1, 2, 3, 4, 5].map(s => <div key={s} className={`h-2 w-8 rounded-full transition-colors ${step >= s ? 'bg-blue-600' : 'bg-gray-200'}`}></div>)}
                    </div>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200"><X size={24} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8">
                {step === 4 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4">
                        <h3 className="font-bold text-lg border-b pb-2 text-gray-700">4. Rounds & Documents</h3>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Application Deadline *</label>
                            <input type="date" className={`w-full p-2 border rounded-lg ${formErrors.applicationDeadline ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} value={newJob.applicationDeadline} onChange={e => setNewJob({...newJob, applicationDeadline: e.target.value})} />
                        </div>
                        <div className="bg-gray-50 p-4 rounded border border-gray-200">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Attachments (JD, Policies)</label>
                            <div className="space-y-2 mb-2">{newJob.documents?.map((doc, i) => (<div key={i} className="flex justify-between items-center p-2 bg-white rounded border"><span className="text-sm text-blue-600 truncate flex items-center gap-2"><FileText size={14}/> {doc.name}</span><button onClick={() => removeDocument(i)} className="text-red-500"><Trash2 size={14}/></button></div>))}</div>
                            <input type="file" accept=".pdf" ref={jobDocInputRef} style={{display: 'none'}} onChange={handleDocumentUpload} />
                            <button onClick={() => !isUploading && jobDocInputRef.current?.click()} disabled={isUploading} className="text-sm font-bold text-blue-600 flex items-center gap-1">
                                {isUploading ? <Loader2 size={16} className="animate-spin"/> : '+ Upload Document'}
                            </button>
                        </div>
                    </div>
                )}
                {/* Simplified view: Steps 1, 2, 3, and 5 exist here in actual implementation */}
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-between items-center rounded-b-xl">
                <button onClick={() => setStep(s => s - 1)} disabled={step === 1} className="px-6 py-2.5 border rounded-lg hover:bg-white disabled:opacity-50 font-bold">Previous</button>
                <div className="flex gap-4">
                    {step < 5 ? (
                        <button onClick={handleNext} className="px-8 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">Next</button>
                    ) : (
                        <button onClick={handleFinalSave} disabled={isUploading} className="px-8 py-2.5 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700">Finish</button>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};
