import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiArrowLeft, FiUsers, FiTrendingUp, FiCreditCard,
  FiActivity, FiMail, FiCalendar, FiUser
} from 'react-icons/fi';
import {
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { useResellerStats, useResellerAnalytics, useSubResellers } from '../../hooks/useResellers';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import Pagination from '../common/Pagination';

const ResellerDeepDive = ({ reseller, onBack }) => {
  const [period, setPeriod] = useState('WEEK');

  const startDate = useMemo(() => {
    const d = new Date();
    const daysToSubtract = period === 'WEEK' ? 7 : 30;
    d.setDate(d.getDate() - daysToSubtract);
    return d.toISOString().split('T')[0];
  }, [period]);

  const { data: stats, isLoading: isStatsLoading } = useResellerStats(reseller?.id);
  const { data: analyticsData, isLoading: isAnalyticsLoading } = useResellerAnalytics(reseller?.id, period, startDate);
  const [subPage, setSubPage] = useState(0);
  const { data: subResellersData, isLoading: isSubLoading } = useSubResellers(reseller?.id, subPage, 10);

  const formattedAnalytics = useMemo(() => {
    if (!analyticsData) return [];
    return analyticsData.map(item => ({
      name: new Date(item.date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' }),
      activations: item.activations,
      revenue: item.revenue
    }));
  }, [analyticsData]);

  if (!reseller) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-subtle hover:text-ink text-sm transition-colors"
      >
        <FiArrowLeft /> Back to reseller list
      </button>

      <div>
        <h1 className="font-display font-semibold text-xl text-ink">
          {reseller.fullName} <span className="text-subtle font-normal text-base">@{reseller.username}</span>
        </h1>
        <div className="flex flex-wrap gap-4 items-center mt-2">
          <Badge status={reseller.active ? 'active' : 'inactive'}>
            {reseller.active ? 'Active partner' : 'Inactive'}
          </Badge>
          <span className="flex items-center gap-1.5 text-subtle text-sm">
            <FiCalendar className="text-xs" /> Member since {new Date(reseller.createdAt).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1.5 text-subtle text-sm">
            <FiMail className="text-xs" /> {reseller.email || 'No email provided'}
          </span>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <p className="text-subtle text-xs uppercase tracking-wide">Total users</p>
          <p className="font-mono font-semibold text-2xl text-ink mt-1">
            {isStatsLoading ? <Spinner size={18} /> : (stats?.totalUsers || reseller.totalUsers || 0)}
          </p>
          <p className="flex items-center gap-1 text-emerald-400 text-xs mt-1">
            <FiTrendingUp className="text-[10px]" /> {stats?.growthPercentage ? `${stats.growthPercentage > 0 ? '+' : ''}${stats.growthPercentage}%` : '+0%'} this month
          </p>
        </Card>
        <Card>
          <p className="text-subtle text-xs uppercase tracking-wide">Active subscriptions</p>
          <p className="font-mono font-semibold text-2xl text-ink mt-1">
            {isStatsLoading ? <Spinner size={18} /> : (stats?.activeSubscriptions || 0)}
          </p>
          <p className="flex items-center gap-1 text-sky-400 text-xs mt-1">
            <FiActivity className="text-[10px]" /> {stats?.totalUsers ? Math.round((stats.activeSubscriptions / stats.totalUsers) * 100) : 0}% retention
          </p>
        </Card>
        <Card>
          <p className="text-subtle text-xs uppercase tracking-wide">Remaining credits</p>
          <p className="font-mono font-semibold text-2xl text-ink mt-1">
            {isStatsLoading ? <Spinner size={18} /> : (stats?.remainingCredits !== undefined ? stats.remainingCredits.toLocaleString() : 0)}
          </p>
          <p className="flex items-center gap-1 text-amber-400 text-xs mt-1">
            <FiCreditCard className="text-[10px]" /> Partner credits
          </p>
        </Card>
        <Card>
          <p className="text-subtle text-xs uppercase tracking-wide">Partner level</p>
          <p className="font-mono font-semibold text-2xl text-maroon-light mt-1">
            {isStatsLoading ? <Spinner size={18} /> : (stats?.partnerLevel || 'Standard')}
          </p>
          <p className="text-subtle text-xs mt-1">KPI performance</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-ink text-sm">Activation trends</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setPeriod('WEEK')}
                className={`text-xs font-medium rounded-lg px-3 py-1.5 border transition-colors ${
                  period === 'WEEK' ? 'bg-maroon/15 text-maroon-light border-maroon/30' : 'text-subtle border-line hover:text-ink'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setPeriod('MONTH')}
                className={`text-xs font-medium rounded-lg px-3 py-1.5 border transition-colors ${
                  period === 'MONTH' ? 'bg-maroon/15 text-maroon-light border-maroon/30' : 'text-subtle border-line hover:text-ink'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>
          <div className="relative" style={{ width: '100%', height: 260 }}>
            {isAnalyticsLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-surface/60 z-10">
                <Spinner />
              </div>
            ) : null}
            <ResponsiveContainer>
              <AreaChart data={formattedAnalytics}>
                <defs>
                  <linearGradient id="colorActivations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C0334A" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#C0334A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9C9498', fontSize: 11 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9C9498', fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#141215',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '8px',
                    color: '#F1EDEE'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="activations"
                  stroke="#C0334A"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorActivations)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="font-display font-semibold text-ink text-sm mb-4">Quick insights</h3>
          <div className="mb-5">
            <div className="flex justify-between mb-1.5">
              <span className="text-subtle text-xs">Target progress</span>
              <span className="text-ink text-xs font-medium">75%</span>
            </div>
            <div className="h-1.5 bg-surface2 rounded-full overflow-hidden">
              <div className="h-full bg-maroon-light rounded-full" style={{ width: '75%' }} />
            </div>
          </div>
          <ul className="space-y-3">
            <li className="flex gap-3">
              <div className="w-9 h-9 rounded-lg bg-maroon/15 text-maroon-light flex items-center justify-center shrink-0">
                <FiUsers className="text-sm" />
              </div>
              <div>
                <div className="text-ink text-sm font-medium">Primary growth</div>
                <div className="text-subtle text-xs">Mainly from sub-resellers</div>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="w-9 h-9 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
                <FiActivity className="text-sm" />
              </div>
              <div>
                <div className="text-ink text-sm font-medium">Peak activity</div>
                <div className="text-subtle text-xs">{stats?.peakActivationTime || 'Not available'}</div>
              </div>
            </li>
          </ul>
        </Card>
      </div>

      {/* Sub-resellers */}
      <div>
        <h3 className="font-display font-semibold text-ink text-sm mb-3">Sub-reseller hierarchy</h3>
        <Card noPadding>
          <div className="grid grid-cols-3 gap-4 px-4 md:px-5 py-3 border-b border-line text-subtle text-xs font-medium uppercase tracking-wide">
            <div>Reseller</div>
            <div>Status</div>
            <div>Active users</div>
          </div>

          {isSubLoading ? (
            <div className="flex justify-center py-8"><Spinner size={18} /></div>
          ) : subResellersData?.content?.length > 0 ? (
            <>
              {subResellersData.content.map(sub => (
                <div key={sub.id} className="grid grid-cols-3 gap-4 items-center px-4 md:px-5 py-3.5 border-b border-line last:border-b-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <FiUser className="text-maroon-light shrink-0" />
                    <div className="min-w-0">
                      <div className="text-ink text-sm font-medium truncate">{sub.username}</div>
                      <div className="text-subtle text-xs">Joined {new Date(sub.joinedAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div>
                    <Badge status={sub.status === 'ACTIVE' ? 'active' : 'inactive'}>{sub.status}</Badge>
                  </div>
                  <div className="text-ink text-sm font-medium">{sub.activeUsers}</div>
                </div>
              ))}

              {subResellersData.totalPages > 1 ? (
                <div className="px-4 md:px-5 py-4 border-t border-line">
                  <Pagination
                    currentPage={subPage}
                    totalPages={subResellersData.totalPages}
                    onPageChange={(p) => setSubPage(p)}
                  />
                </div>
              ) : null}
            </>
          ) : (
            <div className="p-10 text-center text-subtle text-sm">No sub-resellers managed by this account.</div>
          )}
        </Card>
      </div>
    </motion.div>
  );
};

export default ResellerDeepDive;