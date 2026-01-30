
import React from 'react';
import { GraduationCap } from 'lucide-react';
import { SemesterMark, MarkFormat } from '../../../../types';

/**
 * Component Name: Step3Academics
 * Directory: components/global/student-directory/wizard/Step3Academics.tsx
 * 
 * Functionality:
 * - Input for Class 10 details.
 * - Toggle between Class 12 and Diploma.
 * - Input for Pre-University details.
 * - Input for B.Tech Semester marks and current CGPA.
 * 
 * Used In: StudentFormWizard
 */

interface Step3AcademicsProps {
    class10: any; setClass10: any;
    class12: any; setClass12: any;
    diploma: any; setDiploma: any;
    degreeSemesters: SemesterMark[]; setDegreeSemesters: any;
    currentCGPA: string; setCurrentCGPA: any;
    currentArrears: string; setCurrentArrears: any;
    edu12Type: 'Class 12' | 'Diploma'; setEdu12Type: any;
}

export const Step3Academics: React.FC<Step3AcademicsProps> = ({
    class10, setClass10,
    class12, setClass12,
    diploma, setDiploma,
    degreeSemesters, setDegreeSemesters,
    currentCGPA, setCurrentCGPA,
    currentArrears, setCurrentArrears,
    edu12Type, setEdu12Type
}) => {

    const renderScoreInput = (data: any, setData: any) => (
        <div className="flex gap-4 items-end mt-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="w-32 shrink-0">
                <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Score Type</label>
                <select 
                    className="w-full border p-2.5 rounded-lg text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-100" 
                    value={data.scoreType} 
                    onChange={e => setData({...data, scoreType: e.target.value as MarkFormat})}
                >
                    <option>CGPA</option>
                    <option>Percentage</option>
                    <option>Marks</option>
                </select>
            </div>
            {data.scoreType === 'Marks' ? (
                <>
                    <div className="flex-1">
                        <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Secured Marks</label>
                        <input className="w-full border p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none bg-white text-gray-900" value={data.secured || ''} onChange={e => setData({...data, secured: e.target.value})} placeholder="e.g. 950"/>
                    </div>
                    <div className="flex-1">
                        <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Total Marks</label>
                        <input className="w-full border p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none bg-white text-gray-900" value={data.total || ''} onChange={e => setData({...data, total: e.target.value})} placeholder="e.g. 1000"/>
                    </div>
                </>
            ) : (
                <div className="flex-1">
                    <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">{data.scoreType === 'CGPA' ? 'CGPA' : 'Percentage'}</label>
                    <input className="w-full border p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none bg-white text-gray-900" value={data.score} onChange={e => setData({...data, score: e.target.value})} placeholder={data.scoreType === 'CGPA' ? 'e.g. 9.5' : 'e.g. 85'}/>
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-6 animate-in slide-in-from-right-4">
            <div className="border p-4 rounded-xl bg-gray-50">
                <h4 className="font-bold mb-2 flex items-center gap-2"><GraduationCap size={16}/> Class 10 (SSC/Matric)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input className="border p-2 rounded text-sm bg-white text-gray-900" placeholder="Board (e.g. CBSE)" value={class10.board} onChange={e => setClass10({...class10, board: e.target.value})} />
                    <input className="border p-2 rounded text-sm bg-white text-gray-900" placeholder="School Name" value={class10.institution} onChange={e => setClass10({...class10, institution: e.target.value})} />
                    <input className="border p-2 rounded text-sm bg-white text-gray-900" placeholder="Year of Passing" value={class10.year} onChange={e => setClass10({...class10, year: e.target.value})} />
                </div>
                {renderScoreInput(class10, setClass10)}
            </div>
            
            <div className="border p-4 rounded-xl bg-gray-50">
                <div className="flex justify-between mb-2">
                    <h4 className="font-bold flex items-center gap-2"><GraduationCap size={16}/> Pre-University</h4>
                    <div className="flex bg-white rounded border p-0.5">
                        <button onClick={() => setEdu12Type('Class 12')} className={`px-3 py-1 rounded text-xs font-bold transition-colors ${edu12Type === 'Class 12' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}>Class 12</button>
                        <button onClick={() => setEdu12Type('Diploma')} className={`px-3 py-1 rounded text-xs font-bold transition-colors ${edu12Type === 'Diploma' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}>Diploma</button>
                    </div>
                </div>
                
                {edu12Type === 'Class 12' ? (
                    <div className="space-y-2 animate-in fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input className="border p-2 rounded text-sm bg-white text-gray-900" placeholder="Board (e.g. BIEAP)" value={class12.board} onChange={e => setClass12({...class12, board: e.target.value})} />
                            <input className="border p-2 rounded text-sm bg-white text-gray-900" placeholder="College Name" value={class12.institution} onChange={e => setClass12({...class12, institution: e.target.value})} />
                            <input className="border p-2 rounded text-sm bg-white text-gray-900" placeholder="Specialization (MPC)" value={class12.specialization} onChange={e => setClass12({...class12, specialization: e.target.value})} />
                        </div>
                        <div className="mt-2">
                            <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Year of Passing</label>
                            <input className="border p-2 rounded text-sm w-32 bg-white text-gray-900" placeholder="Year" value={class12.year} onChange={e => setClass12({...class12, year: e.target.value})} />
                        </div>
                        {renderScoreInput(class12, setClass12)}
                    </div>
                ) : (
                    <div className="space-y-2 animate-in fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input className="border p-2 rounded text-sm bg-white text-gray-900" placeholder="Board (e.g. SBTET)" value={diploma.institution} onChange={e => setDiploma({...diploma, institution: e.target.value})} />
                            <input className="border p-2 rounded text-sm bg-white text-gray-900" placeholder="Branch (e.g. DME)" value={diploma.branch} onChange={e => setDiploma({...diploma, branch: e.target.value})} />
                        </div>
                        <div className="mt-2">
                            <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Year of Passing</label>
                            <input className="border p-2 rounded text-sm w-32 bg-white text-gray-900" placeholder="Year" value={diploma.year} onChange={e => setDiploma({...diploma, year: e.target.value})} />
                        </div>
                        {renderScoreInput(diploma, setDiploma)}
                    </div>
                )}
            </div>
            
            <div className="border p-4 rounded-xl bg-gray-50">
                <h4 className="font-bold mb-4 flex items-center gap-2"><GraduationCap size={16}/> B.Tech - Semester Marks</h4>
                <div className="flex gap-4 mb-4">
                    <div className="flex-1"><label className="text-xs font-bold text-gray-500 uppercase">Current CGPA</label><input className="w-full border p-2 rounded text-sm bg-white text-gray-900" value={currentCGPA} onChange={e => setCurrentCGPA(e.target.value)} placeholder="Auto Calc" /></div>
                    <div className="flex-1"><label className="text-xs font-bold text-gray-500 uppercase">Current Backlogs</label><input className="w-full border p-2 rounded text-sm bg-white text-gray-900" value={currentArrears} onChange={e => setCurrentArrears(e.target.value)} placeholder="0" /></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {degreeSemesters.map((sem, idx) => {
                        const isLateralEntry = edu12Type === 'Diploma';
                        const isFirstYear = sem.sem === 1 || sem.sem === 2;
                        const isDisabled = isLateralEntry && isFirstYear;

                        return (
                            <div key={sem.sem} className={isDisabled ? 'opacity-50 grayscale' : ''}>
                                <label className="text-[10px] uppercase font-bold text-gray-500">Sem {sem.sem} SGPA</label>
                                <input 
                                    className="w-full border p-2 rounded text-sm bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed" 
                                    placeholder={isDisabled ? "Lateral Entry" : "SGPA"} 
                                    value={isDisabled ? '' : sem.sgpa} 
                                    onChange={(e) => {
                                        const newSems = [...degreeSemesters];
                                        newSems[idx].sgpa = e.target.value;
                                        setDegreeSemesters(newSems);
                                    }} 
                                    disabled={isDisabled} 
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
