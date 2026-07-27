import React from 'react';
import { FiCheck } from 'react-icons/fi';

const Checkbox = ({ label, checked, onChange, disabled }) => (
  <label className={`flex items-center gap-2.5 text-sm text-ink select-none ${disabled ? 'opacity-50' : 'cursor-pointer'}`}>
    <span
      onClick={() => !disabled && onChange(!checked)}
      className={`w-4.5 h-4.5 w-[18px] h-[18px] rounded-md border flex items-center justify-center transition-colors shrink-0 ${
        checked ? 'bg-maroon border-maroon' : 'border-line bg-surface2'
      }`}
    >
      {checked ? <FiCheck className="text-ink text-[11px]" /> : null}
    </span>
    {label}
  </label>
);

export default Checkbox;