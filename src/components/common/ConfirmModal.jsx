import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiInfo, FiX } from 'react-icons/fi';

const ConfirmModal = ({
  show,
  onHide,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false
}) => {
  const isDanger = variant === 'danger';

  return (
    <AnimatePresence>
      {show ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70"
            onClick={!isLoading ? onHide : undefined}
          />

          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="relative w-full max-w-sm bg-surface border border-line rounded-2xl p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${
                  isDanger ? 'bg-maroon/15 text-maroon-light' : 'bg-sky-500/10 text-sky-400'
                }`}
              >
                {isDanger ? <FiAlertTriangle /> : <FiInfo />}
              </div>
              <button
                onClick={onHide}
                disabled={isLoading}
                aria-label="Close"
                className="text-subtle hover:text-ink disabled:opacity-40"
              >
                <FiX />
              </button>
            </div>

            <div className="text-center mb-6">
              <h3 className="font-display font-semibold text-ink text-base mb-1.5">{title}</h3>
              <p className="text-subtle text-sm leading-relaxed">{message}</p>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={onHide}
                disabled={isLoading}
                className="text-sm font-medium text-subtle hover:text-ink transition-colors disabled:opacity-40"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={`text-sm font-medium rounded-lg px-5 py-2.5 transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                  isDanger
                    ? 'bg-maroon hover:bg-maroon-light text-ink'
                    : 'bg-sky-600 hover:bg-sky-500 text-ink'
                }`}
              >
                {isLoading ? "Processing..." : confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
};

export default ConfirmModal;