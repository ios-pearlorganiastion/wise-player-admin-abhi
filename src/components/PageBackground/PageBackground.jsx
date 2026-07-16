import React from 'react';

const PageBackground = ({ children, className = '' }) => (
  <div className={`relative min-h-screen bg-base overflow-hidden ${className}`}>
    <div className="pointer-events-none absolute -top-32 -left-32 w-72 h-72 md:w-96 md:h-96 bg-maroon/20 rounded-full blur-3xl animate-pulse-slow" />
    <div
      className="pointer-events-none absolute -bottom-32 -right-32 w-72 h-72 md:w-96 md:h-96 bg-maroon/10 rounded-full blur-3xl animate-pulse-slow"
      style={{ animationDelay: '1.5s' }}
    />
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.05] animate-scan"
      style={{
        backgroundImage: 'repeating-linear-gradient(to bottom, rgba(255,255,255,0.6) 0px, rgba(255,255,255,0.6) 1px, transparent 1px, transparent 3px)',
        backgroundSize: '100% 4px',
      }}
    />
    <div className="pointer-events-none absolute inset-0" style={{ boxShadow: 'inset 0 0 200px 60px rgba(0,0,0,0.6)' }} />
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -inset-y-full w-1/3 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent -skew-x-12 animate-sweep" />
    </div>

    <div className="relative">{children}</div>
  </div>
);

export default PageBackground;