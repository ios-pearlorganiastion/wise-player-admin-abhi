import React from 'react';

const Card = ({ children, className = '', noPadding = false }) => (
  <div className={`bg-surface border border-line rounded-xl ${noPadding ? '' : 'p-4'} ${className}`}>
    {children}
  </div>
);

export default Card;