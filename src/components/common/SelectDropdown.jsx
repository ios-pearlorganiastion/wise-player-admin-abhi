import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown } from 'react-icons/fi';

const SelectDropdown = ({ label, placeholder, isLoading, selectedLabel, children, isOpen, onToggle }) => (
  <div className="mb-4">
    {label ? <label className="block text-subtle text-xs font-medium mb-1.5">{label}</label> : null}
    {isLoading ? (
      <div className="h-10 flex items-center justify-center bg-surface2 border border-line rounded-lg">
        <div className="animate-spin rounded-full border-2 border-line border-t-maroon-light w-4 h-4" />
      </div>
    ) : (
      <div className="relative">
        <button
          type="button"
          onClick={onToggle}
          className={`w-full flex items-center justify-between bg-surface2 border rounded-lg px-3 h-10 text-sm transition-colors ${
            isOpen ? 'border-maroon-light' : 'border-line'
          }`}
        >
          <span className={selectedLabel ? 'text-ink' : 'text-subtle'}>{selectedLabel || placeholder}</span>
          <FiChevronDown className={`text-subtle text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen ? (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 mt-2 bg-surface border border-line rounded-xl p-1.5 shadow-lg z-50 max-h-60 overflow-y-auto"
            >
              {children}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    )}
  </div>
);

export default SelectDropdown;