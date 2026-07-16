import React, { useState, useCallback } from 'react';
import { FiTrendingUp, FiDollarSign, FiActivity } from 'react-icons/fi';
import { usePayments, usePaymentStats } from '../../hooks/usePayments';
import { useAuthContext } from '../../contexts/AuthContext';
import ColumnFilter from '../common/ColumnFilter';
import Pagination from '../common/Pagination';
import Sidebar from '../Shared/Sidebar';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Spinner from '../common/Spinner';
import ErrorAlert from '../common/ErrorAlert';
import HamburgerIcon from '../common/HamburgerIcon';
import ProfileMenu from '../common/ProfileMenu';

const Payments = () => {
  const { user } = useAuthContext();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [page, setPage] = useState(0);
  const size = 20;

  const [filters, setFilters] = useState({
    paymentId: '',
    deviceId: '',
    status: ''
  });

  const activeFilters = {
    ...(filters.paymentId ? { paymentId: filters.paymentId } : {}),
    ...(filters.deviceId ? { deviceId: filters.deviceId } : {}),
    ...(filters.status ? { status: filters.status } : {}),
  };

  const { data: paymentsData, isLoading: isPaymentsLoading, error: paymentsError } = usePayments(page, size, activeFilters);
  const { data: statsData, isLoading: isStatsLoading, error: statsError } = usePaymentStats();

  const payments = paymentsData?.content || [];

  const handleFilterChange = useCallback((column, value) => {
    setFilters(prev => ({ ...prev, [column]: value }));
    setPage(0);
  }, []);

  const stats = [
    { title: 'Total revenue', value: `€${statsData?.totalRevenue || 0}`, icon: <FiDollarSign />, iconBg: 'bg-sky-500/10', iconText: 'text-sky-400' },
    { title: 'Successful transactions', value: statsData?.successfulTransactions || 0, icon: <FiTrendingUp />, iconBg: 'bg-emerald-500/10', iconText: 'text-emerald-400' },
    { title: 'Total transactions', value: statsData?.totalTransactions || 0, icon: <FiActivity />, iconBg: 'bg-amber-500/10', iconText: 'text-amber-400' },
  ];

  const gridCols = 'grid-cols-[130px_minmax(150px,1.8fr)_110px_100px_100px_90px_110px]';

  return (
    <div className="flex min-h-screen bg-base">
      <Sidebar
        activePage="payments"
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
                Revenue &amp; <span className="text-maroon-light">Payments</span>
              </h1>
              <p className="hidden sm:block text-subtle text-sm mt-0.5">Track all transactions and revenue metrics</p>
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

          {isStatsLoading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : statsError ? (
            <ErrorAlert>Error loading stats: {statsError.message}</ErrorAlert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              {stats.map((stat, i) => (
                <Card key={i} className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-subtle text-xs uppercase tracking-wide truncate">{stat.title}</p>
                    <p className="font-mono font-semibold text-xl md:text-2xl text-ink mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center shrink-0 ${stat.iconBg} ${stat.iconText}`}>
                    {stat.icon}
                  </div>
                </Card>
              ))}
            </div>
          )}

          <Card noPadding>
            <div className="flex items-center justify-between px-4 md:px-5 py-4 border-b border-line">
              <h2 className="font-display font-semibold text-sm md:text-base text-ink">Transactions</h2>
              <span className="text-[11px] font-mono text-subtle bg-surface2 border border-line rounded-full px-3 py-1.5">
                {paymentsData?.totalElements ?? 0} results
              </span>
            </div>

            <div className="overflow-x-auto">
              <div className={`grid ${gridCols} gap-3 px-4 md:px-5 py-3 min-w-[980px] border-b border-line`}>
                <div className="flex items-center gap-1 text-subtle text-xs font-medium uppercase tracking-wide">
                  Payment ID <ColumnFilter column="paymentId" onFilterChange={handleFilterChange} placeholder="ID" />
                </div>
                <div className="flex items-center gap-1 text-subtle text-xs font-medium uppercase tracking-wide">
                  Mac address <ColumnFilter column="deviceId" onFilterChange={handleFilterChange} placeholder="MAC/ID" />
                </div>
                <div className="text-subtle text-xs font-medium uppercase tracking-wide">Plan</div>
                <div className="text-subtle text-xs font-medium uppercase tracking-wide text-right">Amount</div>
                <div className="text-subtle text-xs font-medium uppercase tracking-wide">Date</div>
                <div className="text-subtle text-xs font-medium uppercase tracking-wide">Time</div>
                <div className="flex items-center gap-1 justify-end text-subtle text-xs font-medium uppercase tracking-wide">
                  Status
                  <ColumnFilter
                    column="status"
                    onFilterChange={handleFilterChange}
                    placeholder="Status"
                    options={[
                      { label: 'Pending', value: 'PENDING' },
                      { label: 'Success', value: 'SUCCESS' },
                      { label: 'Failed', value: 'FAILED' },
                      { label: 'Refunded', value: 'REFUNDED' },
                      { label: 'Disputed', value: 'DISPUTED' },
                      { label: 'Reversed', value: 'REVERSED' }
                    ]}
                    alignRight
                  />
                </div>
              </div>

              {isPaymentsLoading ? (
                <div className="flex justify-center py-10"><Spinner /></div>
              ) : paymentsError ? (
                <div className="p-4"><ErrorAlert>Error loading payments: {paymentsError.message}</ErrorAlert></div>
              ) : payments.length === 0 ? (
                <div className="p-8 text-center text-subtle text-sm">No matching transactions found.</div>
              ) : (
                payments.map((payment) => (
                  <div
                    key={payment.paymentId}
                    className={`grid ${gridCols} gap-3 items-center px-4 md:px-5 py-3.5 min-w-[980px] border-b border-line last:border-b-0 hover:bg-surface2/60 transition-colors`}
                  >
                    <div className="font-mono text-subtle text-xs truncate" title={payment.paymentId}>
                      {payment.paymentId}
                    </div>
                    <div className="font-medium text-ink text-sm truncate" title={payment.macAddress}>
                      {payment.macAddress || <span className="text-subtle italic">N/A</span>}
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-sky-400 bg-sky-500/10 rounded-full px-2 py-1">
                        {payment.plan || payment.planName || payment.subscriptionPlan || 'N/A'}
                      </span>
                    </div>
                    <div className="font-mono font-semibold text-emerald-400 text-sm text-right">{payment.amount} €</div>
                    <div className="text-subtle text-sm">{new Date(payment.createdAt).toLocaleDateString()}</div>
                    <div className="text-subtle text-sm">
                      {new Date(payment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex justify-end">
                      <Badge status={payment.status || 'pending'}>{payment.status}</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>

            {paymentsData && paymentsData.totalPages > 1 ? (
              <div className="px-4 md:px-5 py-4 border-t border-line">
                <Pagination
                  currentPage={page}
                  totalPages={paymentsData.totalPages}
                  onPageChange={(p) => setPage(p)}
                />
              </div>
            ) : null}
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Payments;