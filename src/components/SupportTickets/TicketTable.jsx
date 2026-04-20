import React from 'react';
import { Badge, Spinner, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FiEye, FiClock, FiCheckCircle, FiXCircle, FiInfo } from 'react-icons/fi';

const TicketTable = ({ tickets, isLoading, error, onViewDetails }) => {
  if (isLoading) {
    return (
      <div className="text-center my-5 py-5">
        <Spinner animation="border" variant="info" />
        <p className="mt-3 text-muted">Fetching support tickets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-4">
        <FiXCircle className="me-2" />
        Error loading tickets: {error.message}
      </div>
    );
  }

  if (!tickets || tickets.length === 0) {
    return (
      <div className="empty-state-container">
        <div className="empty-icon"><FiInfo /></div>
        <h3>No Tickets Found</h3>
        <p>There are no support tickets matching your current filter.</p>
      </div>
    );
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'OPEN': return <FiClock className="me-1" />;
      case 'IN_PROGRESS': return <FiClock className="me-1" />;
      case 'RESOLVED': return <FiCheckCircle className="me-1" />;
      case 'CLOSED': return <FiXCircle className="me-1" />;
      default: return null;
    }
  };

  return (
    <div className="custom-table-wrapper" style={{ overflowX: 'auto' }}>
      <div className="table-header-row support-table-grid">
        <div className="th-cell align-left">NAME</div>
        <div className="th-cell align-left">EMAIL</div>
        <div className="th-cell align-left">INQUIRY TYPE</div>
        <div className="th-cell align-left">MAC ADDRESS</div>
        <div className="th-cell align-center">STATUS</div>
        <div className="th-cell align-left">CREATED</div>
        <div className="th-cell align-center">ACTION</div>
      </div>

      {tickets.map((ticket, index) => (
        <motion.div 
          key={ticket.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="table-data-row align-items-center support-table-grid"
        >
          <div className="td-cell align-left fw-bold text-white px-2">
            {ticket.firstName} {ticket.lastName}
          </div>
          <div className="td-cell align-left text-white-50 tiny-text" title={ticket.email}>
            {ticket.email}
          </div>
          <div className="td-cell align-left">
            <span className="text-info">{ticket.inquiryType}</span>
          </div>
          <div className="td-cell align-left font-monospace small">
            {ticket.macAddress}
          </div>
          <div className="td-cell align-center">
            <Badge className={`status-pill ${ticket.status.toLowerCase()}`}>
              {getStatusIcon(ticket.status)}
              {ticket.status.replace('_', ' ')}
            </Badge>
          </div>
          <div className="td-cell align-left small">
            {new Date(ticket.createdAt).toLocaleDateString()}
          </div>
          <div className="td-cell align-center">
            <Button 
              variant="outline-info" 
              size="sm" 
              className="action-btn-neon"
              onClick={() => onViewDetails(ticket)}
            >
              <FiEye className="me-1" /> View
            </Button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default TicketTable;
