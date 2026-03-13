import React from 'react';
import { StudentProfile } from '../../../../types';
import { GraduationCap, Award, Calculator, TrendingUp, Lock } from 'lucide-react';

/**
 * AcademicsTab
 * Path: components/colleges/student-portal/profile/AcademicsTab.tsx
 *
 * ─── FIXES ───────────────────────────────────────────────────────────────────
 * 1. Reads educationHistory OR educationRecords with fallback chain:
 *      profileData.educationHistory → profileData.educationRecords → []
 *    (studentService.getStudent360 now injects education into both places,
 *     but the fallback handles any edge-case ordering issues)
 *
 * 2. Field-name normalisation helpers:
 *      resolveScore()     → edu.score ?? edu.scoreDisplay ?? edu.score_display
 *      resolveScoreType() → edu.scoreType ?? edu.score_type
 *      resolveSemesters() → edu.semesters (array) OR parse edu.semestersData (string)
 *    These helpers make the component resilient to whatever shape the backend
 *    sends, without requiring exact field-name alignment.
 *
 * 3. Education level matching handles both casing styles:
 *      'Undergraduate' (what backend EducationLevel enum serialises to)
 *      'UNDERGRADUATE' (what raw string values may look like)
 *
 * 4. Shows a read-only info banner explaining students cannot edit academic records.
 */

interface AcademicsTabProps {
    profileData: StudentProfile;
}

// ── Field resolution helpers ──────────────────────────────────────────────────

/** Get the score string, trying multiple field names the backend may use */
const resolveScore = (edu: any): string =>
    edu.score ?? edu.scoreDisplay ?? edu.score_display ?? '';

/** Get the score type string */
const resolveScoreType = (edu: any): string =>
    edu.scoreType ?? edu.score_type ?? '';

/**
 * Get semesters as an array.
 * Backend stores as JSON in semestersData column; Jackson may serialise it as
 * a string. studentService.getStudent360 already parses it, but we handle
 * the raw-string case here too for safety.
 */
const resolveSemesters = (edu: any): any[] => {
    if (Array.isArray(edu.semesters) && edu.semesters.length > 0) return edu.semesters;
    const raw = edu.semestersData ?? edu.semesters_data;
    if (raw) {
        try {
            const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
            return Array.isArray(parsed) ? parsed : [];
        } catch { return []; }
    }
    return [];
};

/** Case-insensitive check for Undergraduate or Postgraduate education level */
const isHigherEducation = (level: string): boolean => {
    const l = level?.toUpperCase() ?? '';
    return l === 'UNDERGRADUATE' || l === 'POSTGRADUATE';
};

const isPostgraduate = (level: string): boolean =>
    (level?.toUpperCase() ?? '') === 'POSTGRADUATE';

// ── Component ─────────────────────────────────────────────────────────────────

export const AcademicsTab: React.FC<AcademicsTabProps> = ({ profileData }) => {
    /**
     * Fallback chain:
     *   1. profileData.educationHistory  ← injected by studentService.getStudent360
     *   2. profileData.educationRecords  ← legacy root-level field (just in case)
     *   3. []                            ← show empty state
     */
    const history: any[] =
        (profileData as any).educationHistory ??
        (profileData as any).educationRecords ??
        [];

    /**
     * Calculate dynamic CGPA from semester SGPA values.
     * Returns the average as a 2-decimal string, or null if no valid semesters.
     */
    const calculateAggregatedCGPA = (edu: any): string | null => {
        const semesters = resolveSemesters(edu);
        if (semesters.length === 0) return null;
        const validSems = semesters.filter(
            (s: any) => s.sgpa != null && !isNaN(parseFloat(String(s.sgpa)))
        );
        if (validSems.length === 0) return null;
        const sum = validSems.reduce(
            (acc: number, curr: any) => acc + parseFloat(String(curr.sgpa)), 0
        );
        return (sum / validSems.length).toFixed(2);
    };

    /** Render the score badge with appropriate label */
    const displayScore = (edu: any) => {
        const score     = resolveScore(edu);
        const scoreType = resolveScoreType(edu);
        const higherEd  = isHigherEducation(edu.level);
        const calculated = higherEd ? calculateAggregatedCGPA(edu) : null;
        const finalScore = calculated ?? score;

        if (!finalScore) return null;

        if (scoreType === 'Marks' && String(finalScore).includes('/')) {
            const [secured, total] = String(finalScore).split('/').map(Number);
            const pct = total > 0 ? ((secured / total) * 100).toFixed(1) : '0';
            return (
                <div className="text-right">
                    <span className="text-2xl font-bold text-blue-600 block">{finalScore}</span>
                    <span className="text-xs font-bold text-gray-500 uppercase mt-1">Marks / {pct}%</span>
                </div>
            );
        }

        if (scoreType === 'CGPA') {
            const numeric = parseFloat(String(finalScore));
            const pct = !isNaN(numeric) ? (numeric * 10).toFixed(1) : 'N/A';
            return (
                <div className="text-right">
                    <div className="flex flex-col items-end">
                        <span className="text-2xl font-bold text-blue-600 block">
                            {finalScore}{' '}
                            <span className="text-sm font-medium text-blue-400">CGPA</span>
                        </span>
                        {calculated && (
                            <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold mt-1 flex items-center gap-1">
                                <Calculator size={10} /> Dynamic Avg
                            </span>
                        )}
                    </div>
                    <span className="text-xs font-bold text-gray-500 uppercase mt-1">/ {pct}%</span>
                </div>
            );
        }

        return (
            <div className="text-right">
                <span className="text-2xl font-bold text-blue-600 block">
                    {finalScore}{scoreType === 'Percentage' ? '%' : ''}
                </span>
                <span className="text-xs font-bold text-gray-500 uppercase mt-1">{scoreType}</span>
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right-2">

            {/* Read-only notice banner */}
            <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                <Lock size={16} className="text-amber-500 shrink-0" />
                <p>
                    <span className="font-bold">Academic records are read-only.</span>{' '}
                    These details are filled in by your college admin or placement team.
                    Contact them to request corrections.
                </p>
            </div>

            {history.length > 0 ? (
                history.map((edu: any, index: number) => {
                    const higherEd   = isHigherEducation(edu.level);
                    const totalSems  = isPostgraduate(edu.level) ? 4 : 8;
                    const semesters  = resolveSemesters(edu);
                    const dynamicCGPA = higherEd ? calculateAggregatedCGPA(edu) : null;

                    return (
                        <div
                            key={edu.id ?? index}
                            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                        >
                            {/* Header row */}
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex gap-4">
                                    <div
                                        className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-inner shrink-0 ${
                                            higherEd
                                                ? 'bg-blue-50 text-blue-600 border-blue-100'
                                                : 'bg-gray-50 text-gray-400 border-gray-100'
                                        }`}
                                    >
                                        <GraduationCap size={24} />
                                    </div>
                                    <div>
                                        <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded mb-1 uppercase tracking-wider">
                                            {edu.level}
                                        </span>
                                        <h3 className="text-lg font-bold text-gray-900 leading-tight">
                                            {edu.institution}
                                        </h3>
                                        <p className="text-sm text-gray-500 font-medium mt-0.5">
                                            {edu.board} • {edu.yearOfPassing} Passing Batch
                                        </p>
                                        {(edu.specialization || edu.branch) && (
                                            <p className="text-xs text-gray-400 mt-1">
                                                {edu.specialization ?? edu.branch}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div>{displayScore(edu)}</div>
                            </div>

                            {/* Semester grid — only for UG / PG */}
                            {higherEd && (
                                <div className="mt-6 border-t border-gray-50 pt-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                            <Award size={16} className="text-amber-500" />
                                            Semester-wise SGPA
                                        </h4>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">
                                                Current Backlogs
                                            </p>
                                            <p
                                                className={`font-bold text-sm ${
                                                    edu.currentArrears && edu.currentArrears > 0
                                                        ? 'text-red-600'
                                                        : 'text-green-600'
                                                }`}
                                            >
                                                {edu.currentArrears ?? 0}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                                        {Array.from({ length: totalSems }).map((_, i) => {
                                            const semNum = i + 1;
                                            const semData = semesters.find(
                                                (s: any) =>
                                                    Number(s.sem) === semNum ||
                                                    String(s.sem) === `Sem ${semNum}`
                                            );
                                            return (
                                                <div
                                                    key={semNum}
                                                    className={`p-3 rounded-xl text-center border transition-all ${
                                                        semData
                                                            ? 'bg-blue-50 border-blue-100 ring-2 ring-transparent hover:ring-blue-200'
                                                            : 'bg-gray-50 border-gray-100'
                                                    }`}
                                                >
                                                    <p className="text-[9px] text-gray-400 uppercase font-bold mb-1">
                                                        Sem {semNum}
                                                    </p>
                                                    <p
                                                        className={`font-bold text-sm ${
                                                            semData ? 'text-blue-700' : 'text-gray-300'
                                                        }`}
                                                    >
                                                        {semData?.sgpa ?? '--'}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {dynamicCGPA && (
                                        <div className="mt-6 p-4 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl text-white flex justify-between items-center shadow-lg shadow-blue-100">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                                    <TrendingUp size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase opacity-80">
                                                        Consolidated Aggregate
                                                    </p>
                                                    <p className="text-sm font-bold">
                                                        Average of {semesters.length} Semester{semesters.length !== 1 ? 's' : ''}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-black">{dynamicCGPA}</p>
                                                <p className="text-[10px] font-bold uppercase opacity-80">
                                                    Calculated CGPA
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })
            ) : (
                <div className="p-12 text-center bg-gray-50 border-2 border-dashed rounded-2xl text-gray-400">
                    <GraduationCap size={64} className="mx-auto mb-4 opacity-10" />
                    <p className="text-lg font-medium">No academic records found.</p>
                    <p className="text-sm mt-1">
                        Your college admin will add your academic details. Check back later.
                    </p>
                </div>
            )}
        </div>
    );
};