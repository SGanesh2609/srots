import React from 'react';
import { GraduationCap } from 'lucide-react';
import { SemesterMark, MarkFormat } from '../../../../types';

/**
 * Step3Academics
 * Path: src/components/global/student-directory/wizard/Step3Academics.tsx
 *
 * CHANGES:
 * - Added `readOnly?: boolean` to Step3AcademicsProps interface
 * - All inputs/selects/buttons get disabled={readOnly}
 * - Class 12 / Diploma toggle buttons get pointer-events-none in readOnly
 * - Input styling dims in readOnly mode (bg-gray-50)
 * - renderScoreInput() uses readOnly-aware input classes
 */

interface Step3AcademicsProps {
    class10: any;               setClass10: any;
    class12: any;               setClass12: any;
    diploma: any;               setDiploma: any;
    degreeSemesters: SemesterMark[]; setDegreeSemesters: any;
    currentCGPA: string;        setCurrentCGPA: any;
    currentArrears: string;     setCurrentArrears: any;
    edu12Type: 'Class 12' | 'Diploma'; setEdu12Type: any;
    readOnly?: boolean;   // ← ADDED
}

export const Step3Academics: React.FC<Step3AcademicsProps> = ({
    class10, setClass10,
    class12, setClass12,
    diploma, setDiploma,
    degreeSemesters, setDegreeSemesters,
    currentCGPA, setCurrentCGPA,
    currentArrears, setCurrentArrears,
    edu12Type, setEdu12Type,
    readOnly = false
}) => {

    const inputClass =
        `w-full border p-2 rounded text-sm text-gray-900 transition-colors border-gray-200
        ${readOnly ? 'bg-gray-50 cursor-default' : 'bg-white focus:ring-2 focus:ring-blue-100 outline-none'}`;

    const selectClass =
        `w-full border p-2.5 rounded-lg text-sm text-gray-900 transition-colors border-gray-200
        ${readOnly ? 'bg-gray-50 cursor-default' : 'bg-white focus:ring-2 focus:ring-blue-100 outline-none'}`;

    const renderScoreInput = (data: any, setData: any) => (
        <div className="flex gap-4 items-end mt-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="w-32 shrink-0">
                <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Score Type</label>
                <select
                    className={selectClass}
                    value={data.scoreType}
                    onChange={e => { if (!readOnly) setData({ ...data, scoreType: e.target.value as MarkFormat }); }}
                    disabled={readOnly}
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
                        <input
                            className={selectClass}
                            value={data.secured || ''}
                            onChange={e => { if (!readOnly) setData({ ...data, secured: e.target.value }); }}
                            disabled={readOnly}
                            placeholder="e.g. 950"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Total Marks</label>
                        <input
                            className={selectClass}
                            value={data.total || ''}
                            onChange={e => { if (!readOnly) setData({ ...data, total: e.target.value }); }}
                            disabled={readOnly}
                            placeholder="e.g. 1000"
                        />
                    </div>
                </>
            ) : (
                <div className="flex-1">
                    <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">
                        {data.scoreType === 'CGPA' ? 'CGPA' : 'Percentage'}
                    </label>
                    <input
                        className={selectClass}
                        value={data.score}
                        onChange={e => { if (!readOnly) setData({ ...data, score: e.target.value }); }}
                        disabled={readOnly}
                        placeholder={data.scoreType === 'CGPA' ? 'e.g. 9.5' : 'e.g. 85'}
                    />
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-6 animate-in slide-in-from-right-4">

            {/* ── Class 10 ──────────────────────────────────────────────────────── */}
            <div className="border p-4 rounded-xl bg-gray-50">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                    <GraduationCap size={16} /> Class 10 (SSC / Matric)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input className={inputClass} placeholder="Board (e.g. CBSE)" value={class10.board}
                        onChange={e => { if (!readOnly) setClass10({ ...class10, board: e.target.value }); }} disabled={readOnly} />
                    <input className={inputClass} placeholder="School Name" value={class10.institution}
                        onChange={e => { if (!readOnly) setClass10({ ...class10, institution: e.target.value }); }} disabled={readOnly} />
                    <input className={inputClass} placeholder="Year of Passing" value={class10.year}
                        onChange={e => { if (!readOnly) setClass10({ ...class10, year: e.target.value }); }} disabled={readOnly} />
                </div>
                {renderScoreInput(class10, setClass10)}
            </div>

            {/* ── Pre-University ────────────────────────────────────────────────── */}
            <div className="border p-4 rounded-xl bg-gray-50">
                <div className="flex justify-between mb-2">
                    <h4 className="font-bold flex items-center gap-2">
                        <GraduationCap size={16} /> Pre-University
                    </h4>
                    {/* Toggle: pointer-events-none + opacity in readOnly so user can see selection but not change it */}
                    <div className={`flex bg-white rounded border p-0.5 ${readOnly ? 'opacity-60 pointer-events-none' : ''}`}>
                        <button type="button" onClick={() => { if (!readOnly) setEdu12Type('Class 12'); }}
                            className={`px-3 py-1 rounded text-xs font-bold transition-colors ${edu12Type === 'Class 12' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}>
                            Class 12
                        </button>
                        <button type="button" onClick={() => { if (!readOnly) setEdu12Type('Diploma'); }}
                            className={`px-3 py-1 rounded text-xs font-bold transition-colors ${edu12Type === 'Diploma' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}>
                            Diploma
                        </button>
                    </div>
                </div>

                {edu12Type === 'Class 12' ? (
                    <div className="space-y-2 animate-in fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input className={inputClass} placeholder="Board (e.g. BIEAP)" value={class12.board}
                                onChange={e => { if (!readOnly) setClass12({ ...class12, board: e.target.value }); }} disabled={readOnly} />
                            <input className={inputClass} placeholder="College Name" value={class12.institution}
                                onChange={e => { if (!readOnly) setClass12({ ...class12, institution: e.target.value }); }} disabled={readOnly} />
                            <input className={inputClass} placeholder="Specialization (MPC)" value={class12.specialization}
                                onChange={e => { if (!readOnly) setClass12({ ...class12, specialization: e.target.value }); }} disabled={readOnly} />
                        </div>
                        <div className="mt-2">
                            <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Year of Passing</label>
                            <input className={`border p-2 rounded text-sm w-32 border-gray-200 transition-colors ${readOnly ? 'bg-gray-50' : 'bg-white'}`}
                                placeholder="Year" value={class12.year}
                                onChange={e => { if (!readOnly) setClass12({ ...class12, year: e.target.value }); }} disabled={readOnly} />
                        </div>
                        {renderScoreInput(class12, setClass12)}
                    </div>
                ) : (
                    <div className="space-y-2 animate-in fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input className={inputClass} placeholder="Institution Name" value={diploma.institution}
                                onChange={e => { if (!readOnly) setDiploma({ ...diploma, institution: e.target.value }); }} disabled={readOnly} />
                            <input className={inputClass} placeholder="Branch (e.g. DME)" value={diploma.branch}
                                onChange={e => { if (!readOnly) setDiploma({ ...diploma, branch: e.target.value }); }} disabled={readOnly} />
                        </div>
                        <div className="mt-2">
                            <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Year of Passing</label>
                            <input className={`border p-2 rounded text-sm w-32 border-gray-200 transition-colors ${readOnly ? 'bg-gray-50' : 'bg-white'}`}
                                placeholder="Year" value={diploma.year}
                                onChange={e => { if (!readOnly) setDiploma({ ...diploma, year: e.target.value }); }} disabled={readOnly} />
                        </div>
                        {renderScoreInput(diploma, setDiploma)}
                    </div>
                )}
            </div>

            {/* ── B.Tech Semesters ──────────────────────────────────────────────── */}
            <div className="border p-4 rounded-xl bg-gray-50">
                <h4 className="font-bold mb-4 flex items-center gap-2">
                    <GraduationCap size={16} /> B.Tech — Semester Marks
                </h4>
                <div className="flex gap-4 mb-4">
                    <div className="flex-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Current CGPA</label>
                        <input className={inputClass} value={currentCGPA}
                            onChange={e => { if (!readOnly) setCurrentCGPA(e.target.value); }}
                            disabled={readOnly} placeholder="Auto Calculated" />
                    </div>
                    <div className="flex-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Current Backlogs</label>
                        <input className={inputClass} value={currentArrears}
                            onChange={e => { if (!readOnly) setCurrentArrears(e.target.value); }}
                            disabled={readOnly} placeholder="0" />
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {degreeSemesters.map((sem, idx) => {
                        const isLateralEntry = edu12Type === 'Diploma';
                        const isFirstYear    = sem.sem === 1 || sem.sem === 2;
                        const isDisabled     = readOnly || (isLateralEntry && isFirstYear);
                        return (
                            <div key={sem.sem} className={(isLateralEntry && isFirstYear) ? 'opacity-50 grayscale' : ''}>
                                <label className="text-[10px] uppercase font-bold text-gray-500">Sem {sem.sem} SGPA</label>
                                <input
                                    className={`w-full border p-2 rounded text-sm border-gray-200 transition-colors ${isDisabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white focus:ring-2 focus:ring-blue-100 outline-none'}`}
                                    placeholder={(isLateralEntry && isFirstYear) ? 'Lateral Entry' : 'SGPA'}
                                    value={(isLateralEntry && isFirstYear) ? '' : sem.sgpa}
                                    onChange={e => {
                                        if (readOnly || (isLateralEntry && isFirstYear)) return;
                                        const newSems = [...degreeSemesters];
                                        newSems[idx] = { ...newSems[idx], sgpa: e.target.value };
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