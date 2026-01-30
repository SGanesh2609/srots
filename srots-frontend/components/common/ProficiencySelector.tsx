
import React from 'react';

/**
 * Component Name: ProficiencySelector
 * Directory: components/common/ProficiencySelector.tsx
 * 
 * Functionality:
 * - A visual slider UI for selecting skill/language proficiency levels (1-5).
 * - Displays dynamic labels corresponding to the selected level.
 * 
 * Used In: StudentProfile (Skills Tab)
 */

interface ProficiencySelectorProps {
    current: number;
    onChange: (val: number) => void;
    labels: string[];
}

export const ProficiencySelector: React.FC<ProficiencySelectorProps> = ({ current, onChange, labels }) => {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex justify-between px-1">
                {labels.map((l, i) => (
                    <div key={i} className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => onChange(i + 1)}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${current === i + 1 ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}>
                            {i + 1}
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-between px-2">
                <span className="text-xs font-bold text-gray-500">{labels[0]}</span>
                <span className="text-xs font-bold text-blue-600">{labels[current - 1]}</span>
                <span className="text-xs font-bold text-gray-500">{labels[labels.length - 1]}</span>
            </div>
            <input 
                type="range" min="1" max="5" step="1" 
                value={current} 
                onChange={(e) => onChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
        </div>
    );
};
