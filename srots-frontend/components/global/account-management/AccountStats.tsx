
import React from 'react';
import { AlertTriangle, Clock, Trash2 } from 'lucide-react';

/**
 * Component Name: AccountStats
 * Directory: components/global/account-management/AccountStats.tsx
 * 
 * Functionality:
 * - Renders overview statistics cards for account management.
 * - Displays count of Expiring, Grace Period, and To-Be-Deleted accounts.
 * 
 * Used In: ManagingStudentAccounts
 */

interface AccountStatsProps {
    stats: {
        expiring: number;
        grace: number;
        toBeDeleted: number;
    };
}

export const AccountStats: React.FC<AccountStatsProps> = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                <div className="flex items-center gap-1.5 text-red-700 font-bold mb-0.5 text-xs"><AlertTriangle size={13} /> Expiring &lt; 30 Days</div>
                <p className="text-base font-bold text-gray-900">{stats.expiring} Students</p>
            </div>
            <div className="p-3 bg-orange-50 border border-orange-100 rounded-xl">
                <div className="flex items-center gap-1.5 text-orange-700 font-bold mb-0.5 text-xs"><Clock size={13} /> Grace Period</div>
                <p className="text-base font-bold text-gray-900">{stats.grace} Students</p>
            </div>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                <div className="flex items-center gap-1.5 text-gray-700 font-bold mb-0.5 text-xs"><Trash2 size={13} /> To Be Deleted</div>
                <p className="text-base font-bold text-gray-900">{stats.toBeDeleted} Students</p>
            </div>
        </div>
    );
};
