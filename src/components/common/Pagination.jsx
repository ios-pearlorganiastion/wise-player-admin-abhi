import React from 'react';
import Button from './Button';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-4">
      <Button
        variant="secondary"
        disabled={currentPage === 0}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </Button>
      <span className="text-subtle text-sm">Page {currentPage + 1} of {totalPages}</span>
      <Button
        variant="secondary"
        disabled={currentPage >= totalPages - 1}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </Button>
    </div>
  );
};

export default Pagination;