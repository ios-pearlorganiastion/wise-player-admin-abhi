import React from 'react';

const Input = ({ label, icon, className = '', ...props }) => (
  <div className="mb-4">
    {label ? <label className="block text-subtle text-xs font-medium mb-1.5">{label}</label> : null}
    <div className="relative flex items-center">
      {icon ? (
        <span className="absolute left-3 z-10 text-subtle text-sm pointer-events-none flex items-center">{icon}</span>
      ) : null}
      <input
        {...props}
        className={`w-full bg-surface2 border border-line rounded-lg h-11 text-sm text-ink outline-none focus:border-maroon-light transition-colors placeholder:text-subtle disabled:opacity-50 ${icon ? 'pl-10 pr-3' : 'px-3'} ${className}`}
      />
    </div>
  </div>
);

export default Input;