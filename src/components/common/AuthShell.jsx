import React from 'react';
import { motion } from 'framer-motion';
import PageBackground from '../PageBackground/PageBackground';
import WisePlayerLogo from '../WisePlayerLogo/WisePlayerLogo';

const AuthShell = ({ children, maxWidth = 420 }) => (
  <PageBackground className="flex items-center justify-center p-4">
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative w-full"
      style={{ maxWidth }}
    >
      {/* Antenna */}
      <div className="relative h-6 flex justify-center">
        <div className="absolute bottom-0 w-16 h-6">
          <div className="absolute left-1/2 bottom-0 w-px h-6 bg-line origin-bottom -rotate-[28deg]" />
          <div className="absolute left-1/2 bottom-0 w-px h-6 bg-line origin-bottom rotate-[28deg]" />
          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-2 h-2 rounded-full bg-maroon-light shadow-[0_0_8px_2px_rgba(192,51,74,0.6)]" />
        </div>
      </div>

      {/* TV bezel */}
      <div className="relative bg-surface border-2 border-line rounded-2xl p-1.5 shadow-2xl">
        <div className="relative bg-surface2/60 rounded-xl overflow-hidden p-6 md:p-8">
          <div className="absolute top-4 right-4 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_2px_rgba(52,211,153,0.6)] animate-pulse" />
            <span className="text-[10px] font-mono text-emerald-400 tracking-wider">ON AIR</span>
          </div>

          <div className="relative">
            <div className="text-center mb-6">
             <div className="flex justify-center mb-3">
               <WisePlayerLogo size={52} animate bg="#141215" />
            </div>
              <h1 className="font-display font-semibold text-2xl text-ink tracking-wide"> <span className="text-ink">WISE</span> <span className="text-maroon-light">PLAYER</span></h1>
              <p className="text-subtle text-xs mt-1 font-mono">ADMIN — SECURE ACCESS</p>
            </div>

            {children}
          </div>
        </div>

        
      </div>
    </motion.div>
  </PageBackground>
);

export default AuthShell;