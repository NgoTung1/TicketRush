import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange
}) => {
  // Mock logic for rendering page numbers like < ... 21 22 [23] 24 25 ... >
  const renderPageNumbers = () => {
    const pages = [];
    
    // For simplicity, showing a fixed mock window centered around currentPage
    // if totalPages is large enough, else show all
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <button
            key={i}
            onClick={() => onPageChange(i)}
            className={`px-2 py-1 text-sm ${currentPage === i ? 'text-white bg-gray-600 rounded' : 'text-gray-400 hover:text-white'}`}
          >
            {i}
          </button>
        );
      }
    } else {
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, currentPage + 2);

      // Only show ellipsis when there are hidden pages before/after the window
      if (start > 1) {
        pages.push(
          <span key="start-ellipsis" className="text-gray-400 px-1">...</span>
        );
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(
          <button
            key={i}
            onClick={() => onPageChange(i)}
            className={`px-2 py-1 text-sm mx-0.5 rounded ${currentPage === i ? 'text-white bg-gray-600' : 'text-gray-400 hover:text-white'}`}
          >
            {i}
          </button>
        );
      }

      if (end < totalPages) {
        pages.push(
          <span key="end-ellipsis" className="text-gray-400 px-1">...</span>
        );
      }
    }
    
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed px-2 py-1 text-sm"
        aria-label="First page"
      >
        {'<<'}
      </button>

      <button 
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed p-1"
      >
        <ChevronLeft size={18} />
      </button>
      
      {renderPageNumbers()}
      
      <button 
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed p-1"
      >
        <ChevronRight size={18} />
      </button>

      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed px-2 py-1 text-sm"
        aria-label="Last page"
      >
        {'>>'}
      </button>
    </div>
  );
};
