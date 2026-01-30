
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                <div className="flex items-center gap-2 text-red-700 font-bold mb-1"><AlertTriangle size={18} /> Expiring &lt; 30 Days</div>
                <p className="text-2xl font-bold text-gray-900">{stats.expiring} Students</p>
            </div>
            <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl">
                <div className="flex items-center gap-2 text-orange-700 font-bold mb-1"><Clock size={18} /> Grace Period</div>
                <p className="text-2xl font-bold text-gray-900">{stats.grace} Students</p>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <div className="flex items-center gap-2 text-gray-700 font-bold mb-1"><Trash2 size={18} /> To Be Deleted</div>
                <p className="text-2xl font-bold text-gray-900">{stats.toBeDeleted} Students</p>
            </div>
        </div>
    );
};
