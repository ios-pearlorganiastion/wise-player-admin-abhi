import React from 'react';

const Button = ({ variant = 'primary', children, onClick, className = '', type = 'button' }) => {
  const base = 'text-sm font-medium rounded-lg px-4 py-2.5 transition-colors flex items-center';
  const variants = {
    primary: 'bg-maroon hover:bg-maroon-light text-ink',
    secondary: 'border border-line hover:border-maroon-light hover:text-maroon-light text-ink',
    ghost: 'text-muted hover:bg-maroon/10 hover:text-maroon-light',
  };
  return (
    <button type={type} onClick={onClick} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

export default Button;