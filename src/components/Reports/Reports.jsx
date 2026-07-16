import React, { useState } from 'react';
import { FiCalendar, FiTrendingUp, FiUsers, FiStar, FiActivity, FiBarChart2 } from 'react-icons/fi';
import Sidebar from '../Shared/Sidebar';
import { useRevenueReport, useDeviceReport, useSubscriptionReport, useResellerReport } from '../../hooks/useReports';
import { useAuthContext } from '../../contexts/AuthContext';
import Card from '../common/Card';
import Input from '../common/Input';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import ErrorAlert from '../common/ErrorAlert';
import HamburgerIcon from '../common/HamburgerIcon';
import ProfileMenu from '../common/ProfileMenu';

const Reports = () => {
  const { user } = useAuthContext();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState(() => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(today);

  const [resellerPage, setResellerPage] = useState(0);
  const resellerPageSize = 10;

  const { data: revenueData, isLoading: isRevLoading, error: revError } = useRevenueReport(fromDate, toDate);
  const { data: deviceData, isLoading: isDevLoading, error: devError } = useDeviceReport(fromDate, toDate);
  const { data: subData, isLoading: isSubLoading, error: subError } = useSubscriptionReport(fromDate, toDate);
  const { data: resellerData, isLoading: isResLoading, error: resError } = useResellerReport(resellerPage, resellerPageSize);

  return (
    <div className="flex min-h-screen bg-base">
      <Sidebar
        activePage="reports"
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
                Reports &amp; <span className="text-maroon-light">Analytics</span>
              </h1>
              <p className="hidden sm:block text-subtle text-sm mt-0.5">Visual performance tracking and statistics</p>
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

          {/* Date range */}
          <Card>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
              <div className="flex items-center gap-3">
                <FiCalendar className="text-maroon-light text-xl shrink-0" />
                <Input
                  label="From date"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="!mb-0"
                />
              </div>
              <div className="flex items-center gap-3">
                <FiCalendar className="text-maroon-light text-xl shrink-0" />
                <Input
                  label="To date"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="!mb-0"
                />
              </div>
              <div className="text-subtle text-sm lg:text-right">
                Range: {new Date(fromDate).toLocaleDateString()} – {new Date(toDate).toLocaleDateString()}
              </div>
            </div>
          </Card>

          {/* Metric cards */}
          <div className="grid lg:grid-cols-3 gap-4">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-ink text-sm flex items-center gap-2">
                  <FiTrendingUp className="text-maroon-light" /> Revenue
                </h3>
                {isRevLoading ? <Spinner size={16} /> : null}
              </div>
              {revError ? (
                <ErrorAlert>Failed to load revenue</ErrorAlert>
              ) : (
                <div className="text-center py-2">
                  <h2 className="font-mono font-semibold text-3xl text-maroon-light">
                    €{Number(revenueData?.totalRevenue || 0).toFixed(2)}
                  </h2>
                  <p className="text-subtle text-sm mt-1">Total period revenue</p>

                  <div className="mt-5 pt-4 border-t border-line flex justify-around">
                    <div className="text-center">
                      <div className="text-subtle text-xs mb-1.5">Successful</div>
                      <span className="text-sm font-medium text-emerald-400 bg-emerald-500/10 rounded-full px-3 py-1">
                        {revenueData?.successfulPayments || 0}
                      </span>
                    </div>
                    <div className="text-center">
                      <div className="text-subtle text-xs mb-1.5">Failed</div>
                      <span className="text-sm font-medium text-maroon-light bg-maroon/15 rounded-full px-3 py-1">
                        {revenueData?.failedPayments || 0}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-ink text-sm flex items-center gap-2">
                  <FiUsers className="text-sky-400" /> Registrations
                </h3>
                {isDevLoading ? <Spinner size={16} /> : null}
              </div>
              {devError ? (
                <ErrorAlert>Failed to load devices</ErrorAlert>
              ) : (
                <div className="text-center py-2">
                  <h2 className="font-mono font-semibold text-3xl text-sky-400">{deviceData?.newDevices || 0}</h2>
                  <p className="text-subtle text-sm mt-1">New registrations</p>
                  <div className="mt-8 flex items-center justify-center gap-1.5 text-subtle text-xs">
                    <FiActivity /> Active device growth
                  </div>
                </div>
              )}
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-ink text-sm flex items-center gap-2">
                  <FiStar className="text-amber-400" /> Subscriptions
                </h3>
                {isSubLoading ? <Spinner size={16} /> : null}
              </div>
              {subError ? (
                <ErrorAlert>Failed to load subscriptions</ErrorAlert>
              ) : (
                <div className="text-center py-2">
                  <h2 className="font-mono font-semibold text-3xl text-amber-400">{subData?.newSubscriptions || 0}</h2>
                  <p className="text-subtle text-sm mt-1">New active subscriptions</p>
                  <div className="mt-8 flex items-center justify-center gap-1.5 text-subtle text-xs">
                    <FiStar /> Revenue contributing subs
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Reseller performance */}
          <div>
            <h3 className="font-display font-semibold text-ink text-sm flex items-center gap-2 mb-3">
              <FiBarChart2 className="text-emerald-400" /> Reseller performance
            </h3>
            <Card noPadding>
              {isResLoading ? (
                <div className="flex justify-center py-10"><Spinner /></div>
              ) : resError ? (
                <div className="p-4"><ErrorAlert>Error loading reseller data</ErrorAlert></div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="grid grid-cols-[minmax(200px,2fr)_120px_120px_130px] gap-4 px-4 md:px-5 py-3 min-w-[700px] border-b border-line">
                    <div className="text-subtle text-xs font-medium uppercase tracking-wide">Reseller</div>
                    <div className="text-subtle text-xs font-medium uppercase tracking-wide text-right">Total users</div>
                    <div className="text-subtle text-xs font-medium uppercase tracking-wide text-right">Active users</div>
                    <div className="text-subtle text-xs font-medium uppercase tracking-wide text-center">Pending req</div>
                  </div>

                  {(resellerData?.content || []).map((res, i) => (
                    <div
                      key={res.id || i}
                      className="grid grid-cols-[minmax(200px,2fr)_120px_120px_130px] gap-4 items-center px-4 md:px-5 py-3.5 min-w-[700px] border-b border-line last:border-b-0 hover:bg-surface2/60 transition-colors"
                    >
                      <div className="flex items-center gap-2 font-medium text-ink text-sm truncate">
                        <FiUsers className="text-emerald-400 shrink-0" />
                        {res.fullName} <span className="text-subtle text-xs">@{res.username}</span>
                      </div>
                      <div className="text-ink text-sm text-right">{res.totalUsers || 0}</div>
                      <div className="text-sky-400 text-sm text-right">{res.activeUsers || 0}</div>
                      <div className="flex justify-center">
                        <span
                          className={`text-[11px] font-medium rounded-full px-2.5 py-1 ${
                            res.pendingRequests > 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-white/5 text-subtle'
                          }`}
                        >
                          {res.pendingRequests || 0}
                        </span>
                      </div>
                    </div>
                  ))}

                  {(!resellerData?.content || resellerData.content.length === 0) ? (
                    <div className="p-10 text-center text-subtle text-sm">No reseller data available</div>
                  ) : null}

                  {resellerData && resellerData.totalPages > 1 ? (
                    <div className="flex items-center justify-between px-4 md:px-5 py-4 border-t border-line">
                      <Button
                        variant="secondary"
                        disabled={resellerData.first}
                        onClick={() => setResellerPage(p => Math.max(0, p - 1))}
                      >
                        Previous
                      </Button>
                      <span className="text-subtle text-sm">Page {resellerPage + 1} of {resellerData.totalPages}</span>
                      <Button
                        variant="secondary"
                        disabled={resellerData.last}
                        onClick={() => setResellerPage(p => p + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  ) : null}
                </div>
              )}
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Reports;