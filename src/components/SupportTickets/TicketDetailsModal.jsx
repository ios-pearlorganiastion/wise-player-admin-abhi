import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUser, FiMail, FiCpu, FiMessageSquare, FiPaperclip, FiSettings, FiCheckCircle } from 'react-icons/fi';
import { useUpdateTicketStatus } from '../../hooks/useSupportTickets';

const InfoRow = ({ icon, label, children }) => (
  <div>
    <div className="flex items-center gap-1.5 text-subtle text-xs font-medium uppercase tracking-wide mb-1.5">
      {icon} {label}
    </div>
    <div className="text-ink text-sm">{children}</div>
  </div>
);

const TicketDetailsModal = ({ ticket, onClose }) => {
  const updateStatusMutation = useUpdateTicketStatus();
  const [localStatus, setLocalStatus] = useState(ticket?.status);

  if (!ticket) return null;

  const handleStatusUpdate = (newStatus) => {
    setLocalStatus(newStatus);
    updateStatusMutation.mutate({ id: ticket.id, status: newStatus });
  };

  const statuses = [
    { key: 'OPEN', label: 'Open' },
    { key: 'IN_PROGRESS', label: 'In progress' },
    { key: 'RESOLVED', label: 'Resolved' },
    { key: 'CLOSED', label: 'Closed' }
  ];

  const statusStyles = {
    OPEN: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    IN_PROGRESS: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    RESOLVED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    CLOSED: 'bg-white/5 text-subtle border-line',
  };

  const getFullUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const baseUrl = (import.meta.env.VITE_API_BASE_URL ?? "https://api.wise-player.com").replace(/\/$/, "");
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const isImage = (url) => {
    if (!url) return false;
    const cleanUrl = url.split('?')[0].toLowerCase();
    return cleanUrl.match(/\.(jpeg|jpg|gif|png|webp|avif|svg)$/) != null;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
        <div className="absolute inset-0 bg-black/60" />
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full sm:w-[420px] h-full bg-surface border-l border-line overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-surface flex items-start justify-between px-5 py-4 border-b border-line z-10">
            <div>
              <h2 className="font-display font-semibold text-ink text-base">Ticket details</h2>
              <p className="text-subtle text-xs mt-1">ID: {ticket.id}</p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-subtle hover:bg-surface2 hover:text-ink transition-colors"
            >
              <FiX />
            </button>
          </div>

          <div className="p-5 space-y-5">
            <InfoRow icon={<FiUser />} label="Customer">
              <span className="font-medium">{ticket.firstName} {ticket.lastName}</span>
            </InfoRow>

            <InfoRow icon={<FiMail />} label="Email address">{ticket.email}</InfoRow>

            <InfoRow icon={<FiCpu />} label="Mac address">
              <span className="font-mono text-xs">{ticket.macAddress}</span>
            </InfoRow>

            <InfoRow icon={<FiSettings />} label="Inquiry type">
              <span className="text-maroon-light">{ticket.inquiryType}</span>
            </InfoRow>

            <InfoRow icon={<FiMessageSquare />} label="Message">
              <div className="bg-surface2 border border-line rounded-lg p-3 text-sm leading-relaxed whitespace-pre-wrap">
                {ticket.message}
              </div>
            </InfoRow>

            {ticket.attachmentUrl && (
              <InfoRow icon={<FiPaperclip />} label="Attachment">
                <div className="space-y-2">
                  <a
                    href={getFullUrl(ticket.attachmentUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-xs font-medium text-ink border border-line hover:border-maroon-light hover:text-maroon-light rounded-lg px-3 py-1.5 transition-colors"
                  >
                    View attachment
                  </a>
                  {isImage(ticket.attachmentUrl) && (
                    <img
                      src={getFullUrl(ticket.attachmentUrl)}
                      alt="Ticket attachment"
                      className="w-full rounded-lg border border-line"
                    />
                  )}
                </div>
              </InfoRow>
            )}

            <div className="pt-2 border-t border-line">
              <div className="flex items-center gap-1.5 text-subtle text-xs font-medium uppercase tracking-wide mb-2.5">
                <FiCheckCircle /> Update status
              </div>
              <div className="flex flex-wrap gap-2">
                {statuses.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => handleStatusUpdate(s.key)}
                    disabled={updateStatusMutation.isPending}
                    className={`text-xs font-medium rounded-lg px-3 py-2 border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                      localStatus === s.key
                        ? statusStyles[s.key]
                        : 'text-subtle border-line hover:text-ink hover:border-line'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              {updateStatusMutation.isPending && (
                <p className="mt-2 text-maroon-light text-xs">Updating status...</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TicketDetailsModal;