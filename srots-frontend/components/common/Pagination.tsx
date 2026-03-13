import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  /** 0-indexed current page */
  page:           number;
  totalPages:     number;
  totalElements:  number;
  pageSize:       number;
  onPageChange:   (page: number) => void;
  /** Optional label e.g. "companies", "students", "courses" */
  itemLabel?:     string;
  /** Show per-page selector. Defaults to false */
  showPageSize?:  boolean;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const pages: (number | '...')[] = [];
  pages.push(0);
  if (current > 3) pages.push('...');
  for (let i = Math.max(1, current - 2); i <= Math.min(total - 2, current + 2); i++) {
    pages.push(i);
  }
  if (current < total - 4) pages.push('...');
  pages.push(total - 1);
  return pages;
}

const NavBtn: React.FC<{
  onClick: () => void;
  disabled: boolean;
  title: string;
  children: React.ReactNode;
}> = ({ onClick, disabled, title, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
  >
    {children}
  </button>
);

export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  itemLabel = 'records',
  showPageSize = false,
  pageSizeOptions = [10, 20, 50, 100],
  onPageSizeChange,
}) => {
  if (totalPages <= 1 && totalElements <= pageSize) return null;

  const startRecord = totalElements === 0 ? 0 : page * pageSize + 1;
  const endRecord   = Math.min((page + 1) * pageSize, totalElements);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-1 py-2">
      {/* Left: record count + optional page-size selector */}
      <div className="flex items-center gap-3 text-sm text-gray-500">
        <span>
          {totalElements === 0
            ? `No ${itemLabel}`
            : `Showing ${startRecord}–${endRecord} of ${totalElements} ${itemLabel}`}
        </span>
        {showPageSize && onPageSizeChange && (
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-500">Per page:</label>
            <select
              value={pageSize}
              onChange={e => onPageSizeChange(Number(e.target.value))}
              className="border rounded-lg px-2 py-1 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
              {pageSizeOptions.map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: navigation buttons */}
      <div className="flex items-center gap-1">
        <NavBtn onClick={() => onPageChange(0)} disabled={page === 0} title="First page">
          <ChevronsLeft size={16} />
        </NavBtn>
        <NavBtn onClick={() => onPageChange(page - 1)} disabled={page === 0} title="Previous page">
          <ChevronLeft size={16} />
        </NavBtn>

        {getPageNumbers(page, totalPages).map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(Number(p))}
              aria-current={Number(p) === page ? 'page' : undefined}
              aria-label={`Page ${Number(p) + 1}`}
              className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${
                Number(p) === page
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {Number(p) + 1}
            </button>
          )
        )}

        <NavBtn onClick={() => onPageChange(page + 1)} disabled={page >= totalPages - 1} title="Next page">
          <ChevronRight size={16} />
        </NavBtn>
        <NavBtn onClick={() => onPageChange(totalPages - 1)} disabled={page >= totalPages - 1} title="Last page">
          <ChevronsRight size={16} />
        </NavBtn>
      </div>
    </div>
  );
};
