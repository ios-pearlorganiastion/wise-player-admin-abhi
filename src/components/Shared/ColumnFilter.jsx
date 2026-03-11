import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiX, FiFilter } from 'react-icons/fi';
import './ColumnFilter.css';

const ColumnFilter = ({ column, onFilterChange, placeholder, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState('');

  const handleClear = (e) => {
    e.stopPropagation();
    setValue('');
    onFilterChange(column, '');
    setIsOpen(false);
  };

  const handleChange = (e) => {
    const newVal = e.target.value;
    setValue(newVal);
    onFilterChange(column, newVal);
  };

  return (
    <div className="filter-container">
      <div className={`filter-trigger ${value ? 'active' : ''}`} onClick={() => setIsOpen(!isOpen)}>
        <FiFilter className="filter-icon" />
        {value && <span className="filter-dot" />}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="filter-dropdown glass-card"
          >
            <div className="filter-header">
              <span className="small fw-bold text-muted">Filter {placeholder}</span>
              <FiX className="close-filter" onClick={() => setIsOpen(false)} />
            </div>

            {options ? (
              <div className="filter-options">
                <div 
                  className={`filter-option ${!value ? 'selected' : ''}`}
                  onClick={() => { setValue(''); onFilterChange(column, ''); setIsOpen(false); }}
                >
                  All
                </div>
                {options.map(opt => (
                  <div 
                    key={opt.value} 
                    className={`filter-option ${value === opt.value ? 'selected' : ''}`}
                    onClick={() => { setValue(opt.value); onFilterChange(column, opt.value); setIsOpen(false); }}
                  >
                    {opt.label}
                  </div>
                ))}
              </div>
            ) : (
              <div className="filter-input-wrapper">
                <FiSearch className="search-icon-inner" />
                <input 
                  type="text" 
                  value={value}
                  onChange={handleChange}
                  placeholder={`Search ${placeholder}...`}
                  autoFocus
                />
                {value && <FiX className="clear-icon-inner" onClick={handleClear} />}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ColumnFilter;
