import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';

const Modal = ({ show, onHide, title, children }) => (
  <AnimatePresence>
    {show ? (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70"
          onClick={onHide}
        />
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.97 }}
          transition={{ duration: 0.18 }}
          className="relative w-full max-w-md bg-surface border border-line rounded-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-surface flex items-center justify-between px-5 py-4 border-b border-line">
            <h2 className="font-display font-semibold text-ink text-base">{title}</h2>
            <button
              onClick={onHide}
              aria-label="Close"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-subtle hover:bg-surface2 hover:text-ink transition-colors"
            >
              <FiX />
            </button>
          </div>
          <div className="p-5">{children}</div>
        </motion.div>
      </div>
    ) : null}
  </AnimatePresence>
);

export default Modal;