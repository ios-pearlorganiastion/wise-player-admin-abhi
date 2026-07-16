import React from 'react';

const NavItem = ({ icon, label, active, badge, onClick, danger = false }) => {
  return (
    <div
      onClick={onClick}
      title={label}
      className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-colors
        ${active
          ? 'bg-surface2 border-l-2 border-maroon-light text-ink font-medium'
          : danger
            ? 'text-muted hover:bg-maroon/10 hover:text-maroon-light'
            : 'text-muted hover:bg-surface2 hover:text-ink'
        }`}
    >
      <span className="flex items-center gap-3 min-w-0">
        <span className={`w-4 shrink-0 text-center ${active ? 'text-maroon-light' : ''}`}>{icon}</span>
        <span className="truncate">{label}</span>
      </span>
      {badge > 0 && (
        <span className="shrink-0 text-[11px] font-mono font-semibold bg-maroon/20 text-maroon-light rounded-full px-1.5 py-0.5">
          {badge}
        </span>
      )}
    </div>
  );
};

export default NavItem;