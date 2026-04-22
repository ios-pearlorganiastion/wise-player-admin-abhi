import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Row, Col, Badge, Button, Table, Spinner } from 'react-bootstrap';
import { 
  FiArrowLeft, FiUsers, FiTrendingUp, FiCreditCard, 
  FiActivity, FiMail, FiCalendar, FiUser 
} from 'react-icons/fi';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { useResellerStats } from '../../hooks/useResellers';
import './Resellers.css';

const ResellerDeepDive = ({ reseller, onBack }) => {
  const { data: stats, isLoading: isStatsLoading } = useResellerStats(reseller?.id);

  // Mock data for analytics - in a real app, this would come from useResellerReports
  const analyticsData = useMemo(() => [
    { name: 'Mon', activations: 12, revenue: 240 },
    { name: 'Tue', activations: 19, revenue: 380 },
    { name: 'Wed', activations: 15, revenue: 300 },
    { name: 'Thu', activations: 22, revenue: 440 },
    { name: 'Fri', activations: 30, revenue: 600 },
    { name: 'Sat', activations: 25, revenue: 500 },
    { name: 'Sun', activations: 18, revenue: 360 },
  ], []);

  if (!reseller) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="resellers-container"
    >
      <button className="back-nav-btn" onClick={onBack}>
        <FiArrowLeft /> Back to Reseller List
      </button>

      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h1 className="text-white mb-1">
            {reseller.fullName} <span className="text-white-50 fs-4">@{reseller.username}</span>
          </h1>
          <div className="d-flex gap-3 align-items-center mt-2">
            <Badge className={`badge-classic ${reseller.active ? 'badge-active' : 'badge-inactive'}`}>
              {reseller.active ? 'ACTIVE PARTNER' : 'INACTIVE'}
            </Badge>
            <span className="text-white-50 small">
              <FiCalendar className="me-1" /> Member since {new Date(reseller.createdAt).toLocaleDateString()}
            </span>
            <span className="text-white-50 small">
              <FiMail className="me-1" /> {reseller.email || 'No email provided'}
            </span>
          </div>
        </div>
        <div className="d-flex gap-2">
           <Button variant="outline-danger" className="px-4">Manage Credits</Button>
           <Button variant="danger" className="px-4">Edit Profile</Button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="deep-dive-grid">
        <div className="glass-card insight-card">
          <div className="insight-label">Total Users</div>
          <div className="insight-value">{isStatsLoading ? <Spinner size="sm" animation="border" /> : (stats?.totalUsers || reseller.totalUsers || 0)}</div>
          <div className="text-success small"><FiTrendingUp /> {stats?.growthPercentage ? `+${stats.growthPercentage}%` : '+0%'} this month</div>
        </div>
        <div className="glass-card insight-card">
          <div className="insight-label">Active Subscriptions</div>
          <div className="insight-value">{isStatsLoading ? <Spinner size="sm" animation="border" /> : (stats?.activeSubscriptions || 0)}</div>
          <div className="text-info small"><FiActivity /> {stats?.totalUsers ? Math.round((stats.activeSubscriptions / stats.totalUsers) * 100) : 0}% Retention</div>
        </div>
        <div className="glass-card insight-card">
          <div className="insight-label">Remaining Credits</div>
          <div className="insight-value">{isStatsLoading ? <Spinner size="sm" animation="border" /> : (stats?.remainingCredits !== undefined ? `${stats.remainingCredits.toLocaleString()} ${stats.currency || ''}` : 0)}</div>
          <div className="text-warning small"><FiCreditCard /> Balance Alert</div>
        </div>
        <div className="glass-card insight-card">
          <div className="insight-label">Partner Level</div>
          <div className="insight-value text-info">{isStatsLoading ? <Spinner size="sm" animation="border" /> : (stats?.partnerLevel || 'Standard')}</div>
          <div className="text-white-50 small">{stats?.totalRevenue !== undefined ? `Revenue: ${stats.totalRevenue.toLocaleString()} ${stats.currency || ''}` : 'Top 5% Reseller'}</div>
        </div>
      </div>

      {/* Charts Section */}
      <Row className="g-4">
        <Col lg={8}>
          <div className="glass-card chart-container h-100">
            <div className="chart-header">
              <h3 className="section-title m-0">Activation Trends</h3>
              <div className="d-flex gap-2">
                <Badge bg="dark" className="border border-secondary">Weekly</Badge>
                <Badge bg="transparent" className="text-white-50">Monthly</Badge>
              </div>
            </div>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <AreaChart data={analyticsData}>
                  <defs>
                    <linearGradient id="colorActivations" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E50914" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#E50914" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(20,20,20,0.9)', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#fff'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="activations" 
                    stroke="#E50914" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorActivations)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Col>
        <Col lg={4}>
          <div className="glass-card h-100">
             <h3 className="section-title mb-4">Quick Insights</h3>
             <div className="mb-4">
               <div className="d-flex justify-content-between mb-2">
                 <span className="text-white-50 small">Target Progress</span>
                 <span className="text-white small">75%</span>
               </div>
               <div className="progress" style={{ height: '6px', background: 'rgba(255,255,255,0.1)' }}>
                 <div className="progress-bar bg-danger" style={{ width: '75%' }}></div>
               </div>
             </div>
             <ul className="list-unstyled">
               <li className="d-flex gap-3 mb-3">
                 <div className="stat-icon-box bg-dark p-2 rounded text-danger"><FiUsers /></div>
                 <div>
                   <div className="text-white small fw-bold">Primary Growth</div>
                   <div className="text-white-50 tiny">Mainly from sub-resellers</div>
                 </div>
               </li>
               <li className="d-flex gap-3 mb-3">
                 <div className="stat-icon-box bg-dark p-2 rounded text-info"><FiActivity /></div>
                 <div>
                   <div className="text-white small fw-bold">Peak Activity</div>
                   <div className="text-white-50 tiny">{stats?.peakActivationTime || 'Fridays (8pm - 11pm)'}</div>
                 </div>
               </li>
             </ul>
          </div>
        </Col>
      </Row>

      {/* Sub-resellers Section */}
      <div className="sub-reseller-section">
        <h3 className="section-title mb-4">Sub-Reseller Hierarchy</h3>
        <div className="glass-card p-0 overflow-hidden">
          <div className="sub-reseller-table-row bg-white-10 fw-bold small text-white-50">
            <div>RESELLER</div>
            <div>STATUS</div>
            <div>ACTIVE USERS</div>
            <div className="text-end">ACTION</div>
          </div>
          {/* Mock sub-resellers */}
          {[1, 2, 3].map(i => (
            <div key={i} className="sub-reseller-table-row text-white">
              <div className="d-flex align-items-center gap-2">
                <FiUser className="text-danger" />
                <div>
                  <div className="fw-bold">ElitePartner_{i}</div>
                  <div className="text-white-50 tiny">Joined 2 months ago</div>
                </div>
              </div>
              <div>
                <Badge className="badge-classic badge-active">Active</Badge>
              </div>
              <div className="fw-bold">142</div>
              <div className="text-end">
                <Button variant="link" className="text-info p-0">View Details</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ResellerDeepDive;
