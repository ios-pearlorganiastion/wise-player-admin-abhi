import React from 'react';

const Select = ({ label, children, className = '', ...props }) => (
  <div className="mb-4">
    {label ? <label className="block text-subtle text-xs font-medium mb-1.5">{label}</label> : null}
    <select
      {...props}
      className={`bg-surface2 border border-line rounded-lg px-3 h-10 text-sm text-ink outline-none focus:border-maroon-light transition-colors [&>option]:bg-surface ${className}`}
    >
      {children}
    </select>
  </div>
);

export default Select;