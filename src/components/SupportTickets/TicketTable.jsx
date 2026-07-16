import React from 'react';
import { motion } from 'framer-motion';
import { FiEye, FiClock, FiCheckCircle, FiXCircle, FiInfo } from 'react-icons/fi';
import Badge from '../common/Badge';
import Spinner from '../common/Spinner';
import ErrorAlert from '../common/ErrorAlert';

const TicketTable = ({ tickets, isLoading, error, onViewDetails }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Spinner />
        <p className="text-subtle text-sm">Fetching support tickets...</p>
      </div>
    );
  }

  if (error) {
    return <div className="m-4"><ErrorAlert>Error loading tickets: {error.message}</ErrorAlert></div>;
  }

  if (!tickets || tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
        <FiInfo className="text-subtle text-2xl" />
        <h3 className="font-display font-semibold text-ink text-base">No tickets found</h3>
        <p className="text-subtle text-sm">There are no support tickets matching your current filter.</p>
      </div>
    );
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'OPEN':
      case 'IN_PROGRESS':
        return <FiClock className="text-[11px]" />;
      case 'RESOLVED':
        return <FiCheckCircle className="text-[11px]" />;
      case 'CLOSED':
        return <FiXCircle className="text-[11px]" />;
      default:
        return null;
    }
  };

  const gridCols = 'grid-cols-[minmax(140px,1.5fr)_minmax(180px,2fr)_130px_150px_130px_110px_90px]';

  return (
    <div className="bg-surface border border-line rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <div className={`grid ${gridCols} gap-3 px-4 md:px-5 py-3 min-w-[900px] border-b border-line`}>
          <div className="text-subtle text-xs font-medium uppercase tracking-wide">Name</div>
          <div className="text-subtle text-xs font-medium uppercase tracking-wide">Email</div>
          <div className="text-subtle text-xs font-medium uppercase tracking-wide">Inquiry type</div>
          <div className="text-subtle text-xs font-medium uppercase tracking-wide">Mac address</div>
          <div className="text-subtle text-xs font-medium uppercase tracking-wide text-center">Status</div>
          <div className="text-subtle text-xs font-medium uppercase tracking-wide">Created</div>
          <div className="text-subtle text-xs font-medium uppercase tracking-wide text-center">Action</div>
        </div>

        {tickets.map((ticket, index) => (
          <motion.div
            key={ticket.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: Math.min(index * 0.03, 0.3) }}
            className={`grid ${gridCols} gap-3 items-center px-4 md:px-5 py-3.5 min-w-[900px] border-b border-line last:border-b-0 hover:bg-surface2/60 transition-colors`}
          >
            <div className="font-medium text-ink text-sm truncate">
              {ticket.firstName} {ticket.lastName}
            </div>
            <div className="text-subtle text-sm truncate" title={ticket.email}>
              {ticket.email}
            </div>
            <div className="text-maroon-light text-sm truncate">{ticket.inquiryType}</div>
            <div className="font-mono text-subtle text-xs truncate">{ticket.macAddress}</div>
            <div className="flex justify-center">
              <Badge status={ticket.status}>
                <span className="flex items-center gap-1">{getStatusIcon(ticket.status)}{ticket.status.replace('_', ' ')}</span>
              </Badge>
            </div>
            <div className="text-subtle text-sm">{new Date(ticket.createdAt).toLocaleDateString()}</div>
            <div className="flex justify-center">
              <button
                onClick={() => onViewDetails(ticket)}
                className="flex items-center gap-1.5 text-xs font-medium text-ink border border-line hover:border-maroon-light hover:text-maroon-light rounded-lg px-3 py-1.5 transition-colors"
              >
                <FiEye className="text-[11px]" /> View
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TicketTable;