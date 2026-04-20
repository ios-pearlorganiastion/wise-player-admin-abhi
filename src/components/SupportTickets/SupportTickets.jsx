import React, { useState } from 'react';
import { Badge, Image, Button } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiActivity, FiLogOut, FiFilter, FiSearch } from 'react-icons/fi';
import { useAuthContext } from '../../contexts/AuthContext';
import { useSupportTickets } from '../../hooks/useSupportTickets';
import Sidebar from '../Shared/Sidebar';
import TicketTable from './TicketTable';
import TicketDetailsModal from './TicketDetailsModal';
import './SupportTickets.css';
import '../Dashboard/Dashboard.css';

const SupportTickets = () => {
  const { logout, user } = useAuthContext();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState(''); // Empty means ALL
  const [selectedTicket, setSelectedTicket] = useState(null);

  const { data: ticketsData, isLoading, error } = useSupportTickets(page, 20, statusFilter || undefined);

  const handleNavClick = (id) => {
    // Navigation is handled via Sidebar/Router, but we might need to close mobile menu
    setIsMobileOpen(false);
  };

  const statusOptions = [
    { label: 'All Status', value: '' },
    { label: 'Open', value: 'OPEN' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'Resolved', value: 'RESOLVED' },
    { label: 'Closed', value: 'CLOSED' },
  ];

  return (
    <div className="dashboard-container">
      <Sidebar 
        activePage="support-tickets" 
        isMobileOpen={isMobileOpen} 
        onMobileClose={() => setIsMobileOpen(false)} 
      />

      <div className="content-area">
        <header className="dash-header">
          <div className="header-left-group">
            <button 
              className="mobile-toggle-btn" 
              onClick={() => setIsMobileOpen(true)}
            >
              <FiMenu />
            </button>
            <div className="welcome-text">
              <h1>Admin <span className="highlight">Support</span></h1>
              <p>Manage customer inquiries and support tickets</p>
            </div>
          </div>
          <div className="profile-section">
            <div className="notif-bell"><FiActivity /></div>
            
            <div className="profile-dropdown-container">
              <div 
                className={`profile-avatar-trigger ${showProfileMenu ? 'active' : ''}`}
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <Image 
                  src={`https://ui-avatars.com/api/?name=${user?.fullName || 'Admin'}&background=E50914&color=fff`} 
                  roundedCircle 
                  className="admin-avatar m-0" 
                />
              </div>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="profile-menu"
                  >
                    <div className="px-3 py-2">
                       <div className="fw-bold text-white">{user?.fullName}</div>
                       <div className="small text-muted">{user?.role}</div>
                    </div>
                    <div className="profile-menu-divider"></div>
                    <div className="profile-menu-item logout" onClick={logout}>
                      <FiLogOut /> Logout
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <div className="recent-section mt-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
            <h3 className="section-title m-0">Support Tickets</h3>
            
            <div className="d-flex align-items-center gap-3">
              <div className="filter-group-neon">
                <FiFilter className="me-2 text-info" />
                <select 
                  className="form-select status-select-neon"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(0);
                  }}
                >
                  {statusOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <Badge bg="dark" className="text-info border border-secondary px-3 py-2">
                Total: {ticketsData?.totalElements || 0}
              </Badge>
            </div>
          </div>

          <TicketTable 
            tickets={ticketsData?.content} 
            isLoading={isLoading} 
            error={error} 
            onViewDetails={(ticket) => setSelectedTicket(ticket)}
          />

          {/* Pagination */}
          {ticketsData && ticketsData.totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-4">
              <Button 
                variant="outline-info" 
                className="pagination-btn"
                disabled={ticketsData.first || isLoading} 
                onClick={() => setPage(p => Math.max(0, p - 1))}
              >
                Previous
              </Button>
              <span className="text-muted small">
                Page <span className="text-white fw-bold">{page + 1}</span> of {ticketsData.totalPages}
              </span>
              <Button 
                variant="outline-info" 
                className="pagination-btn"
                disabled={ticketsData.last || isLoading} 
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedTicket && (
          <TicketDetailsModal 
            ticket={selectedTicket} 
            onClose={() => setSelectedTicket(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default SupportTickets;
