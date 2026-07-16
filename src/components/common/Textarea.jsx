import React from 'react';

const Textarea = ({ label, ...props }) => (
  <div className="mb-4">
    {label ? <label className="block text-subtle text-xs font-medium mb-1.5">{label}</label> : null}
    <textarea
      {...props}
      className="w-full bg-surface2 border border-line rounded-lg px-3 py-2.5 text-sm text-ink outline-none focus:border-maroon-light transition-colors placeholder:text-subtle resize-none"
    />
  </div>
);

export default Textarea;