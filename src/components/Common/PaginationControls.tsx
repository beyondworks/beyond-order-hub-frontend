import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '../../assets/icons';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({ currentPage, totalPages, onPageChange }) => {
  const pageNumbers = [];
  const maxPageButtons = 5; // Number of page buttons to show around current page

  let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

  // Adjust startPage if endPage is at the limit and there are fewer than maxPageButtons shown
  if (endPage - startPage + 1 < maxPageButtons) {
    startPage = Math.max(1, endPage - maxPageButtons + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  if (totalPages <= 1) return null; // Don't render pagination if only one page or no pages

  return (
    <div className="pagination-controls" role="navigation" aria-label="Pagination">
      <button 
        onClick={() => onPageChange(1)} 
        disabled={currentPage === 1} 
        aria-label="First page"
      >
        처음
      </button>
      <button 
        onClick={() => onPageChange(currentPage - 1)} 
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <ChevronLeftIcon /> 이전
      </button>
      {startPage > 1 && <span className="pagination-ellipsis">...</span>}
      {pageNumbers.map(number => (
        <button
          key={number}
          onClick={() => onPageChange(number)}
          className={currentPage === number ? 'active' : ''}
          aria-current={currentPage === number ? 'page' : undefined}
          aria-label={`Go to page ${number}`}
        >
          {number}
        </button>
      ))}
      {endPage < totalPages && <span className="pagination-ellipsis">...</span>}
      <button 
        onClick={() => onPageChange(currentPage + 1)} 
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        다음 <ChevronRightIcon />
      </button>
      <button 
        onClick={() => onPageChange(totalPages)} 
        disabled={currentPage === totalPages}
        aria-label="Last page"
      >
        마지막
      </button>
    </div>
  );
};

export default PaginationControls;
