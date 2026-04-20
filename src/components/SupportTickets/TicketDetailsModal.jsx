import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUser, FiMail, FiCpu, FiMessageSquare, FiPaperclip, FiSettings, FiCheckCircle } from 'react-icons/fi';
import { useUpdateTicketStatus } from '../../hooks/useSupportTickets';

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
    { key: 'IN_PROGRESS', label: 'In Progress' },
    { key: 'RESOLVED', label: 'Resolved' },
    { key: 'CLOSED', label: 'Closed' }
  ];

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
      <div className="ticket-detail-overlay" onClick={onClose}>
        <motion.div 
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="ticket-detail-panel"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="ticket-detail-header">
            <div>
              <h2 className="m-0 text-white">Ticket Details</h2>
              <p className="text-muted small mt-1">ID: {ticket.id}</p>
            </div>
            <button className="btn-close-neon" onClick={onClose}>
              <FiX />
            </button>
          </div>

          <div className="ticket-detail-body">
            <div className="ticket-info-group">
              <div className="ticket-info-label"><FiUser className="me-1" /> Customer</div>
              <div className="ticket-info-value fw-bold">{ticket.firstName} {ticket.lastName}</div>
            </div>

            <div className="ticket-info-group">
              <div className="ticket-info-label"><FiMail className="me-1" /> Email Address</div>
              <div className="ticket-info-value">{ticket.email}</div>
            </div>

            <div className="ticket-info-group">
              <div className="ticket-info-label"><FiCpu className="me-1" /> MAC Address</div>
              <div className="ticket-info-value font-monospace">{ticket.macAddress}</div>
            </div>

            <div className="ticket-info-group">
              <div className="ticket-info-label"><FiSettings className="me-1" /> Inquiry Type</div>
              <div className="ticket-info-value"><span className="text-info">{ticket.inquiryType}</span></div>
            </div>

            <div className="ticket-info-group">
              <div className="ticket-info-label"><FiMessageSquare className="me-1" /> Message</div>
              <div className="ticket-message-box">
                {ticket.message}
              </div>
            </div>

            {ticket.attachmentUrl && (
              <div className="ticket-info-group">
                <div className="ticket-info-label"><FiPaperclip className="me-1" /> Attachment</div>
                <div className="mt-2">
                  <a href={getFullUrl(ticket.attachmentUrl)} target="_blank" rel="noopener noreferrer" className="btn btn-outline-info btn-sm">
                    View Original
                  </a>
                  {isImage(ticket.attachmentUrl) && (
                    <div className="attachment-preview">
                      <img src={getFullUrl(ticket.attachmentUrl)} alt="Ticket attachment" />
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="ticket-info-group mt-5">
              <div className="ticket-info-label"><FiCheckCircle className="me-1" /> Update Status</div>
              <div className="status-control-group">
                {statuses.map((s) => (
                  <button
                    key={s.key}
                    className={`status-btn ${localStatus === s.key ? `active ${s.key}` : ''}`}
                    onClick={() => handleStatusUpdate(s.key)}
                    disabled={updateStatusMutation.isPending}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              {updateStatusMutation.isPending && (
                <div className="mt-2 text-info small">Updating status...</div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TicketDetailsModal;
