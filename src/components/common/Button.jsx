import React from 'react';

const Button = ({ variant = 'primary', children, onClick, className = '', type = 'button', disabled = false, title }) => {
  const base = 'text-sm font-medium rounded-lg px-4 py-2.5 transition-colors flex items-center disabled:opacity-60 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-maroon hover:bg-maroon-light text-ink',
    secondary: 'border border-line hover:border-maroon-light hover:text-maroon-light text-ink',
    ghost: 'text-muted hover:bg-maroon/10 hover:text-maroon-light',
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} title={title} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

export default Button;
