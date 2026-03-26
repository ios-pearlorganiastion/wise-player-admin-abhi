import React from 'react';
import { Button } from 'react-bootstrap';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="d-flex justify-content-between align-items-center mt-4">
      <Button 
        variant="outline-info" 
        disabled={currentPage === 0} 
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </Button>
      <span className="text-white-50">Page {currentPage + 1} of {totalPages}</span>
      <Button 
        variant="outline-info" 
        disabled={currentPage >= totalPages - 1} 
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </Button>
    </div>
  );
};

export default Pagination;
