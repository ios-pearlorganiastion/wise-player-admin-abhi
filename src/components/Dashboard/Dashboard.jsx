import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiDollarSign, FiPlay, FiStar, FiActivity, FiClock, FiCreditCard, FiTrendingUp } from 'react-icons/fi';
import { useAuthContext } from '../../contexts/AuthContext';
import { useDashboardStats } from '../../hooks/useDashboard';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import ColumnFilter from '../common/ColumnFilter';
import Sidebar from '../Shared/Sidebar';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Spinner from '../common/Spinner';
import ErrorAlert from '../common/ErrorAlert';
import HamburgerIcon from '../common/HamburgerIcon';
import ProfileMenu from '../common/ProfileMenu';

const StatCard = ({ icon, iconBg, iconText, title, value, sub, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.06, duration: 0.35, ease: 'easeOut' }}
  >
    <Card className="flex items-center justify-between hover:border-line hover:-translate-y-0.5 transition-transform duration-150">
      <div className="min-w-0">
        <p className="text-subtle text-xs uppercase tracking-wide truncate">{title}</p>
        <p className="font-mono font-semibold text-xl md:text-2xl text-ink mt-1">{value}</p>
        {sub ? <p className="text-subtle text-xs mt-1">{sub}</p> : null}
      </div>
      <div className={`w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg} ${iconText}`}>
        {icon}
      </div>
    </Card>
  </motion.div>
);

const BreakdownBar = ({ label, value, total, color, delay }) => {
  const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-subtle text-xs">{label}</span>
        <span className="text-ink text-xs font-medium font-mono">{value}</span>
      </div>
      <div className="h-2 bg-surface2 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay, duration: 0.6, ease: 'easeOut' }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuthContext();
  const displayRole = user?.role === 'SUPER_ADMIN'
    ? 'Super_Admin'
    : user?.role
      ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase().replace('_', ' ')
      : 'Admin';
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { data: statsData, isLoading: isStatsLoading, error: statsError } = useDashboardStats();
  const { data: subsData, isLoading: isSubsLoading, error: subsError } = useSubscriptions(0, 10);

  const [filters, setFilters] = useState({
    deviceId: '',
    plan: '',
    status: ''
  });

  const handleFilterChange = (column, value) => {
    setFilters(prev => ({ ...prev, [column]: value }));
  };

  const filteredSubs = useMemo(() => {
    if (!subsData?.content) return [];
    return subsData.content.filter(sub => {
      return (
        (sub.deviceId.toLowerCase().includes(filters.deviceId.toLowerCase()) ||
          (sub.macAddress && sub.macAddress.toLowerCase().includes(filters.deviceId.toLowerCase()))) &&
        (filters.plan === '' || (sub.plan || sub.planName || sub.subscriptionPlan || '') === filters.plan) &&
        (filters.status === '' || sub.status === filters.status)
      );
    }).slice(0, 5);
  }, [subsData, filters]);

  const primaryStats = [
    {
      title: 'Total devices',
      value: statsData?.totalDevices ?? 0,
      sub: `${statsData?.activeDevices ?? 0} active`,
      icon: <FiUsers />, iconBg: 'bg-maroon/15', iconText: 'text-maroon-light',
    },
    {
      title: 'Subscriptions',
      value: statsData?.totalSubscriptions ?? 0,
      sub: `${statsData?.activeSubscriptions ?? 0} active`,
      icon: <FiStar />, iconBg: 'bg-sky-500/10', iconText: 'text-sky-400',
    },
    {
      title: 'Net revenue',
      value: `€${statsData?.totalRevenue ?? 0}`,
      sub: `${statsData?.totalPayments ?? 0} payments`,
      icon: <FiDollarSign />, iconBg: 'bg-emerald-500/10', iconText: 'text-emerald-400',
    },
    {
      title: 'Pending activations',
      value: statsData?.pendingActivations ?? 0,
      sub: (statsData?.pendingActivations ?? 0) > 0 ? 'Needs review' : 'All clear',
      icon: <FiClock />, iconBg: 'bg-amber-500/10', iconText: 'text-amber-400',
    },
  ];

  const totalDevices = statsData?.totalDevices || 0;
  const totalSubs = statsData?.totalSubscriptions || 0;

  return (
    <div className="flex min-h-screen bg-base">
      <Sidebar
        activePage="dashboard"
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
                {displayRole} <span className="text-maroon-light">Dashboard</span>
              </h1>
              <p className="hidden sm:block text-subtle text-sm mt-0.5">Real-time analytics and subscriptions</p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button className="relative w-9 h-9 hidden sm:flex items-center justify-center rounded-lg hover:bg-surface2 text-subtle">
              <FiActivity />
            </button>
            <ProfileMenu user={user} />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">

          {/* Primary KPIs */}
          {isStatsLoading ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : statsError ? (
            <ErrorAlert>Failed to load dashboard stats: {statsError.message}</ErrorAlert>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {primaryStats.map((stat, i) => (
                <StatCard key={stat.title} {...stat} index={i} />
              ))}
            </div>
          )}

          {/* Breakdown panels */}
          {!isStatsLoading && !statsError ? (
            <div className="grid md:grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.35 }}
              >
                <Card>
                  <div className="flex items-center gap-2 mb-4">
                    <FiUsers className="text-maroon-light text-sm" />
                    <h3 className="font-display font-semibold text-ink text-sm">Device status</h3>
                  </div>
                  <div className="space-y-4">
                    <BreakdownBar label="Active" value={statsData?.activeDevices ?? 0} total={totalDevices} color="bg-emerald-400" delay={0.3} />
                    <BreakdownBar label="Trial" value={statsData?.trialDevices ?? 0} total={totalDevices} color="bg-amber-400" delay={0.35} />
                    <BreakdownBar label="Expired" value={statsData?.expiredDevices ?? 0} total={totalDevices} color="bg-maroon-light" delay={0.4} />
                  </div>
                  <p className="text-subtle text-[11px] mt-4 pt-3 border-t border-line">
                    Out of {totalDevices} total devices registered on the platform.
                  </p>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.35 }}
              >
                <Card>
                  <div className="flex items-center gap-2 mb-4">
                    <FiTrendingUp className="text-sky-400 text-sm" />
                    <h3 className="font-display font-semibold text-ink text-sm">Subscription health</h3>
                  </div>
                  <div className="space-y-4">
                    <BreakdownBar label="Active subscriptions" value={statsData?.activeSubscriptions ?? 0} total={totalSubs} color="bg-sky-400" delay={0.35} />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-line">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                        <FiCreditCard className="text-xs" />
                      </div>
                      <div>
                        <p className="font-mono font-semibold text-ink text-sm">{statsData?.totalPayments ?? 0}</p>
                        <p className="text-subtle text-[11px]">Payments</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                        <FiClock className="text-xs" />
                      </div>
                      <div>
                        <p className="font-mono font-semibold text-ink text-sm">{statsData?.pendingActivations ?? 0}</p>
                        <p className="text-subtle text-[11px]">Pending</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          ) : null}

          {/* Recent subscriptions */}
          <Card noPadding>
            <div className="flex items-center justify-between px-4 md:px-5 py-4 border-b border-line">
              <h2 className="font-display font-semibold text-sm md:text-base" style={{ color: '#F1EDEE' }}>
                Recent subscriptions
              </h2>
            </div>

            <div className="overflow-x-auto">
              <div className="grid grid-cols-[minmax(220px,3.5fr)_120px_120px_120px_110px] gap-4 px-4 md:px-5 py-3 min-w-[820px] border-b border-line">
                <div className="flex items-center gap-1 text-subtle text-xs font-medium uppercase tracking-wide">
                  Mac address
                  <ColumnFilter column="deviceId" onFilterChange={handleFilterChange} placeholder="MAC/ID" />
                </div>
                <div className="flex items-center gap-1 text-subtle text-xs font-medium uppercase tracking-wide">
                  Plan
                  <ColumnFilter
                    column="plan"
                    onFilterChange={handleFilterChange}
                    placeholder="Plan"
                    options={[{ label: 'Annual', value: 'ANNUAL' }, { label: 'Lifetime', value: 'LIFETIME' }, { label: 'Trial', value: 'TRIAL' }]}
                  />
                </div>
                <div className="text-subtle text-xs font-medium uppercase tracking-wide">Start date</div>
                <div className="text-subtle text-xs font-medium uppercase tracking-wide">End date</div>
                <div className="flex items-center gap-1 justify-end text-subtle text-xs font-medium uppercase tracking-wide">
                  Status
                  <ColumnFilter
                    column="status"
                    onFilterChange={handleFilterChange}
                    placeholder="Status"
                    options={[{ label: 'Active', value: 'ACTIVE' }, { label: 'Trial', value: 'TRIAL' }, { label: 'Expired', value: 'EXPIRED' }, { label: 'Cancelled', value: 'CANCELLED' }]}
                    alignRight
                  />
                </div>
              </div>

              {isSubsLoading ? (
                <div className="flex justify-center py-8"><Spinner size={18} /></div>
              ) : subsError ? (
                <div className="p-4"><ErrorAlert>Failed to load recent subscriptions: {subsError.message}</ErrorAlert></div>
              ) : filteredSubs.length === 0 ? (
                <div className="p-8 text-center text-subtle text-sm">No matching subscriptions found.</div>
              ) : (
                filteredSubs.map((sub) => (
                  <div
                    key={sub.id}
                    className="grid grid-cols-[minmax(220px,3.5fr)_120px_120px_120px_110px] gap-4 px-4 md:px-5 py-3.5 min-w-[820px] border-b border-line last:border-b-0 hover:bg-surface2/60 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FiPlay className="text-maroon-light shrink-0" />
                      <span className="font-medium text-ink text-sm truncate" title={sub.macAddress || sub.deviceId}>
                        {sub.macAddress || <span className="text-subtle italic">N/A</span>}
                      </span>
                    </div>
                    <div className="text-ink text-sm flex items-center truncate">{sub.plan || sub.planName || sub.subscriptionPlan}</div>
                    <div className="text-subtle text-sm flex items-center">{new Date(sub.startDate).toLocaleDateString()}</div>
                    <div className="text-subtle text-sm flex items-center">{new Date(sub.endDate).toLocaleDateString()}</div>
                    <div className="flex items-center justify-end">
                      <Badge status={sub.status}>{sub.status}</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

        </main>
      </div>
    </div>
  );
};

export default Dashboard;