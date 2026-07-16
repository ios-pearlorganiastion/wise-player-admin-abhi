import React from 'react';
import { theme } from '../../theme/theme';

const Badge = ({ status = 'inactive', children }) => {
  const key = String(status).toLowerCase();
  const style = theme.status[key] || theme.status.inactive;
  return (
    <span className={`text-[11px] font-medium uppercase tracking-wide ${style.bg} ${style.text} rounded-full px-2.5 py-1`}>
      {children}
    </span>
  );
};

export default Badge;