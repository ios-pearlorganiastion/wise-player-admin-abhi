import React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiX, FiFilter } from 'react-icons/fi';

const ColumnFilter = ({ column, onFilterChange, placeholder, options, alignRight }) => {
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
    <div className="relative inline-flex shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Filter ${placeholder}`}
        className={`relative w-6 h-6 flex items-center justify-center rounded-md transition-colors ${
          value || isOpen ? 'text-maroon-light bg-maroon/10' : 'text-subtle hover:bg-surface2 hover:text-ink'
        }`}
      >
        <FiFilter className="text-[13px]" />
        {value ? (
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-maroon-light border border-surface" />
        ) : null}
      </button>

      <AnimatePresence>
        {isOpen ? (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className={`absolute top-full mt-2 w-56 bg-surface border border-line rounded-xl p-3 shadow-lg z-50 ${
                alignRight ? 'right-0' : 'left-0'
              }`}
            >
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-medium text-ink normal-case tracking-normal">Filter {placeholder}</span>
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Close filter"
                  className="text-subtle hover:text-ink"
                >
                  <FiX className="text-sm" />
                </button>
              </div>

              {options ? (
                <div className="flex flex-col gap-1">
                  <div
                    onClick={() => { setValue(''); onFilterChange(column, ''); setIsOpen(false); }}
                    className={`text-sm px-3 py-2 rounded-lg cursor-pointer transition-colors normal-case tracking-normal ${
                      !value ? 'bg-maroon/10 text-maroon-light font-medium' : 'text-subtle hover:bg-surface2 hover:text-ink'
                    }`}
                  >
                    All
                  </div>
                  {options.map(opt => (
                    <div
                      key={opt.value}
                      onClick={() => { setValue(opt.value); onFilterChange(column, opt.value); setIsOpen(false); }}
                      className={`text-sm px-3 py-2 rounded-lg cursor-pointer transition-colors normal-case tracking-normal ${
                        value === opt.value ? 'bg-maroon/10 text-maroon-light font-medium' : 'text-subtle hover:bg-surface2 hover:text-ink'
                      }`}
                    >
                      {opt.label}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="relative flex items-center">
                  <FiSearch className="absolute left-3 text-subtle text-xs" />
                  <input
                    type="text"
                    value={value}
                    onChange={handleChange}
                    placeholder={`Search ${placeholder}...`}
                    autoFocus
                    className="w-full bg-surface2 border border-line rounded-lg pl-8 pr-8 h-9 text-sm text-ink outline-none focus:border-maroon-light normal-case tracking-normal placeholder:text-subtle"
                  />
                  {value ? (
                    <button
                      onClick={handleClear}
                      aria-label="Clear filter"
                      className="absolute right-2.5 text-subtle hover:text-maroon-light"
                    >
                      <FiX className="text-xs" />
                    </button>
                  ) : null}
                </div>
              )}
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default ColumnFilter;