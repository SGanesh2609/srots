
import React from 'react';
import { StudentProfile } from '../../../../types';
import { GraduationCap, Award, Calculator, TrendingUp } from 'lucide-react';

/**
 * Component Name: AcademicsTab
 * Directory: components/colleges/student-portal/profile/AcademicsTab.tsx
 * 
 * Functionality:
 * - Renders the student's educational history.
 * - **Dynamic CGPA**: Calculates consolidation CGPA from semester marks.
 * - **B.Tech Optimized**: Displays semester grid for undergraduate records.
 * 
 * Used In: StudentProfile
 */

interface AcademicsTabProps {
    profileData: StudentProfile;
}

export const AcademicsTab: React.FC<AcademicsTabProps> = ({ profileData }) => {
    const history = profileData.educationHistory || [];

    // Logic: Find UG record and calculate Average CGPA from semesters
    const calculateAggregatedCGPA = (edu: any) => {
        if (!edu.semesters || edu.semesters.length === 0) return null;
        const validSems = edu.semesters.filter((s: any) => s.sgpa && !isNaN(parseFloat(s.sgpa)));
        if (validSems.length === 0) return null;
        const sum = validSems.reduce((acc: number, curr: any) => acc + parseFloat(curr.sgpa), 0);
        return (sum / validSems.length).toFixed(2);
    };

    const displayScore = (edu: any) => {
        const { score, scoreType } = edu;
        const isHigherEd = edu.level === 'Undergraduate' || edu.level === 'Postgraduate';
        const calculated = isHigherEd ? calculateAggregatedCGPA(edu) : null;
        const finalScore = calculated || score;

        if (scoreType === 'Marks' && finalScore.includes('/')) {
            const [secured, total] = finalScore.split('/').map(Number);
            const percentage = total > 0 ? ((secured / total) * 100).toFixed(1) : '0';
            return (
                <div className="text-right">
                    <span className="text-2xl font-bold text-blue-600 block">{finalScore}</span>
                    <span className="text-xs font-bold text-gray-500 uppercase mt-1">Marks / {percentage}%</span>
                </div>
            );
        }
        if (scoreType === 'CGPA') {
            const numericScore = parseFloat(finalScore);
            const percentage = !isNaN(numericScore) ? (numericScore * 10).toFixed(1) : 'N/A'; 
            return (
                <div className="text-right">
                    <div className="flex flex-col items-end">
                        <span className="text-2xl font-bold text-blue-600 block">
                            {finalScore} <span className="text-sm font-medium text-blue-400">CGPA</span>
                        </span>
                        {calculated && (
                            <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold mt-1 flex items-center gap-1">
                                <Calculator size={10}/> Dynamic Avg
                            </span>
                        )}
                    </div>
                    <span className="text-xs font-bold text-gray-500 uppercase mt-1">/ {percentage}%</span>
                </div>
            );
        }
        return (
            <div className="text-right">
                <span className="text-2xl font-bold text-blue-600 block">{finalScore}{scoreType === 'Percentage' ? '%' : ''}</span>
                <span className="text-xs font-bold text-gray-500 uppercase mt-1">{scoreType}</span>
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right-2">
            {history.length > 0 ? history.map((edu, index) => {
                const isHigherEd = edu.level === 'Undergraduate' || edu.level === 'Postgraduate';
                const totalSems = edu.level === 'Postgraduate' ? 4 : 8;
                const dynamicCGPA = isHigherEd ? calculateAggregatedCGPA(edu) : null;

                return (
                    <div key={index} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-inner shrink-0 ${isHigherEd ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                                    <GraduationCap size={24}/>
                                </div>
                                <div>
                                    <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded mb-1 uppercase tracking-wider">{edu.level}</span>
                                    <h3 className="text-lg font-bold text-gray-900 leading-tight">{edu.institution}</h3>
                                    <p className="text-sm text-gray-500 font-medium mt-0.5">{edu.board} • {edu.yearOfPassing} Passing Batch</p>
                                    <p className="text-xs text-gray-400 mt-1">{edu.location} {edu.specialization || edu.branch ? `• ${edu.specialization || edu.branch}` : ''}</p>
                                </div>
                            </div>
                            <div>
                                {displayScore(edu)}
                            </div>
                        </div>
                        
                        {isHigherEd && (
                            <div className="mt-6 border-t border-gray-50 pt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                        <Award size={16} className="text-amber-500"/> Semester-wise SGPA
                                    </h4>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Current Backlogs</p>
                                        <p className={`font-bold text-sm ${edu.currentArrears && edu.currentArrears > 0 ? 'text-red-600' : 'text-green-600'}`}>{edu.currentArrears || 0}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                                    {Array.from({ length: totalSems }).map((_, i) => {
                                        const semNum = i + 1;
                                        const semData = edu.semesters?.find((s: any) => s.sem === semNum);
                                        return (
                                            <div key={semNum} className={`p-3 rounded-xl text-center border transition-all ${semData ? 'bg-blue-50 border-blue-100 ring-2 ring-transparent hover:ring-blue-200' : 'bg-gray-50 border-gray-100'}`}>
                                                <p className="text-[9px] text-gray-400 uppercase font-bold mb-1">Sem {semNum}</p>
                                                <p className={`font-bold text-sm ${semData ? 'text-blue-700' : 'text-gray-300'}`}>{semData?.sgpa || '--'}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                                
                                {dynamicCGPA && (
                                    <div className="mt-6 p-4 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl text-white flex justify-between items-center shadow-lg shadow-blue-100">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm"><TrendingUp size={20}/></div>
                                            <div>
                                                <p className="text-[10px] font-bold uppercase opacity-80">Consolidated Aggregate</p>
                                                <p className="text-sm font-bold">Average of {edu.semesters?.length || 0} Semesters</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-black">{dynamicCGPA}</p>
                                            <p className="text-[10px] font-bold uppercase opacity-80">Calculated CGPA</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            }) : (
                <div className="p-12 text-center bg-gray-50 border-2 border-dashed rounded-2xl text-gray-400">
                    <GraduationCap size={64} className="mx-auto mb-4 opacity-10"/>
                    <p className="text-lg font-medium">No academic records found.</p>
                    <p className="text-sm mt-1">Please complete your profile to enable placement tracking.</p>
                </div>
            )}
        </div>
    );
};
