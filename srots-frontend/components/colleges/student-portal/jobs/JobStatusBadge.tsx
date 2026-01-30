
import React from 'react';
import { StudentJobView } from '../../../../types';

interface JobStatusBadgeProps {
    view: StudentJobView;
}

export const JobStatusBadge: React.FC<JobStatusBadgeProps> = ({ view }) => {
    
    // Priority 1: Check if already Applied (Regardless of current eligibility flags)
    if (view.isApplied) {
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">Applied</span>;
    }
    
    // Priority 2: Check Eligibility for those who haven't applied
    if (!view.isEligible) {
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">Not Eligible</span>;
    }
    
    // Priority 3: Check Expiry for eligible non-applicants
    if (view.isExpired) {
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-500 border border-gray-200">Expired</span>;
    }
    
    if (view.isNotInterested) {
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">Not Interested</span>;
    }
    
    // Default for eligible, not applied, and active
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">Open</span>;
};
