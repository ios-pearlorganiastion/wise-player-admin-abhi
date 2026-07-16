import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { FiActivity, FiFilter } from 'react-icons/fi';
import { useAuthContext } from '../../contexts/AuthContext';
import { useSupportTickets } from '../../hooks/useSupportTickets';
import Sidebar from '../Shared/Sidebar';
import TicketTable from './TicketTable';
import TicketDetailsModal from './TicketDetailsModal';
import Button from '../common/Button';
import HamburgerIcon from '../common/HamburgerIcon';
import ProfileMenu from '../common/ProfileMenu';

const SupportTickets = () => {
  const { user } = useAuthContext();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);

  const { data: ticketsData, isLoading, error } = useSupportTickets(page, 20, statusFilter || undefined);

  const statusOptions = [
    { label: 'All status', value: '' },
    { label: 'Open', value: 'OPEN' },
    { label: 'In progress', value: 'IN_PROGRESS' },
    { label: 'Resolved', value: 'RESOLVED' },
    { label: 'Closed', value: 'CLOSED' },
  ];

  return (
    <div className="flex min-h-screen bg-base">
      <Sidebar
        activePage="support-tickets"
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 md:h-20 shrink-0 flex items-center justify-between gap-4 px-4 md:px-6 border-b border-line">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden text-subtle w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface2 shrink-0"
              aria-label="Open menu"
            >
              <HamburgerIcon />
            </button>
            <div className="min-w-0">
              <h1 className="font-display font-semibold text-lg md:text-xl text-ink truncate">
                Admin <span className="text-maroon-light">Support</span>
              </h1>
              <p className="hidden sm:block text-subtle text-sm mt-0.5">Manage customer inquiries and support tickets</p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button className="relative w-9 h-9 hidden sm:flex items-center justify-center rounded-lg hover:bg-surface2 text-subtle">
              <FiActivity />
            </button>
            <ProfileMenu user={user} />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <h2 className="font-display font-semibold text-lg text-ink">Support tickets</h2>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-surface border border-line rounded-lg pl-3 pr-2 h-9">
                <FiFilter className="text-subtle text-xs shrink-0" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(0);
                  }}
                  className="bg-transparent text-sm text-ink outline-none h-full pr-1 [&>option]:bg-surface"
                >
                  {statusOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <span className="text-[11px] font-mono text-subtle bg-surface2 border border-line rounded-full px-3 py-1.5 whitespace-nowrap">
                Total: {ticketsData?.totalElements || 0}
              </span>
            </div>
          </div>

          <TicketTable
            tickets={ticketsData?.content}
            isLoading={isLoading}
            error={error}
            onViewDetails={(ticket) => setSelectedTicket(ticket)}
          />

          {ticketsData && ticketsData.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <Button
                variant="secondary"
                disabled={ticketsData.first || isLoading}
                onClick={() => setPage(p => Math.max(0, p - 1))}
              >
                Previous
              </Button>
              <span className="text-subtle text-sm">
                Page <span className="text-ink font-medium">{page + 1}</span> of {ticketsData.totalPages}
              </span>
              <Button
                variant="secondary"
                disabled={ticketsData.last || isLoading}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </main>
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