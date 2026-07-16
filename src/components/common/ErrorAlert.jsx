import React from 'react';

const ErrorAlert = ({ children, variant = 'danger' }) => {
  const styles = variant === 'success'
    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
    : 'bg-maroon/10 border-maroon/30 text-maroon-light';
  return (
    <div className={`border text-sm rounded-lg px-4 py-3 ${styles}`}>
      {children}
    </div>
  );
};

export default ErrorAlert;