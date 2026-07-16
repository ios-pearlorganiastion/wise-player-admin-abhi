import React from 'react';

const IconButton = ({ icon, onClick, disabled, title, variant = 'default' }) => {
  const variants = {
    default: 'border border-line text-subtle hover:text-ink hover:border-line',
    success: 'border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10',
    danger: 'border border-maroon/40 text-maroon-light hover:bg-maroon/10',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]}`}
    >
      {icon}
    </button>
  );
};

export default IconButton;