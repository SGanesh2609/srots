
import React from 'react';
import { Student, Branch } from '../../../types';
import { StudentFilters } from './StudentFilters';
import { StudentTable } from './StudentTable';

interface StudentListProps {
    students: Student[];
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    yearFilter: string;
    setYearFilter: (year: string) => void;
    branchFilter: string;
    setBranchFilter: (branch: string) => void;
    collegeBranches: Branch[];
    canManage: boolean;
    isSrotsAdmin: boolean;
    onEdit: (e: React.MouseEvent, student: Student) => void;
    onDelete: (e: React.MouseEvent, id: string) => void;
    onToggleRestriction: (e: React.MouseEvent, id: string) => void;
    onDownloadReport: () => void;
    onAdd: () => void;
    onBulkUpload: (e: React.ChangeEvent<HTMLInputElement>) => void; // Maintained for signature compatibility, though logic moved
    onDownloadSample: () => void;
    collegeId?: string; // Added prop
    onRefresh?: () => void; // Added prop
}

export const StudentList: React.FC<StudentListProps> = ({
    students, searchQuery, setSearchQuery, yearFilter, setYearFilter, branchFilter, setBranchFilter,
    collegeBranches, canManage, isSrotsAdmin, onEdit, onDelete, onToggleRestriction,
    onDownloadReport, onAdd, onDownloadSample, collegeId, onRefresh
}) => {
    return (
        <>
            <StudentFilters 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                yearFilter={yearFilter}
                setYearFilter={setYearFilter}
                branchFilter={branchFilter}
                setBranchFilter={setBranchFilter}
                collegeBranches={collegeBranches}
                canManage={canManage}
                onDownloadReport={onDownloadReport}
                onAdd={onAdd}
                onDownloadSample={onDownloadSample}
                collegeId={collegeId || ''}
                onRefresh={onRefresh || (() => {})}
            />

            <StudentTable 
                students={students}
                canManage={canManage}
                isSrotsAdmin={isSrotsAdmin}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleRestriction={onToggleRestriction}
            />
        </>
    );
};
