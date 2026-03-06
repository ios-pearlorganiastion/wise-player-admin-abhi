import React from 'react';
import { Container, Row, Col, Badge, Image, Spinner, Alert } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FiUsers, FiTrendingUp, FiDollarSign, FiPlay, FiStar, FiActivity, FiUserPlus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import { useDashboardStats } from '../../hooks/useDashboard';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { data: statsData, isLoading: isStatsLoading, error: statsError } = useDashboardStats();
  // Fetch a small chunk for "recent"
  const { data: subsData, isLoading: isSubsLoading, error: subsError } = useSubscriptions(0, 5);

  const stats = [
    { title: "Total Devices", value: statsData?.totalDevices || 0, icon: <FiUsers />, color: "n-red", shadow: "rgba(229, 9, 20, 0.4)" },
    { title: "Net Revenue", value: `₹${statsData?.totalRevenue || 0}`, icon: <FiDollarSign />, color: "n-blue", shadow: "rgba(0, 212, 255, 0.4)" },
    { title: "Active Devices", value: statsData?.activeDevices || 0, icon: <FiActivity />, color: "n-green", shadow: "rgba(57, 255, 20, 0.4)" },
    { title: "Active Subs", value: statsData?.activeSubscriptions || 0, icon: <FiStar />, color: "n-yellow", shadow: "rgba(255, 215, 0, 0.4)" },
  ];

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="glass-sidebar">
        <div className="logo-box">WP</div>
        <nav className="nav-links">
          <div className="nav-item active"><FiPlay /></div>
          <div className="nav-item" onClick={() => navigate('/devices')} style={{cursor: 'pointer'}}><FiUsers /></div>
          <div className="nav-item" onClick={() => navigate('/payments')} style={{cursor: 'pointer'}}><FiDollarSign /></div>
          <div className="nav-item" onClick={() => navigate('/subscriptions')} style={{cursor: 'pointer'}}><FiTrendingUp /></div>
          {user?.role === 'SUPER_ADMIN' && (
            <div className="nav-item" onClick={() => navigate('/admin-management')} title="Admin Management" style={{cursor: 'pointer'}}><FiUserPlus /></div>
          )}
        </nav>
      </div>

      <div className="content-area">
        <header className="dash-header">
          <div className="welcome-text">
            <h1>Admin <span className="highlight">Dashboard</span></h1>
            <p>Real-time analytics & subscriptions</p>
          </div>
          <div className="profile-section">
            <div className="notif-bell"><FiActivity /></div>
            <Image src="https://i.pravatar.cc/150?u=admin" roundedCircle className="admin-avatar" />
          </div>
        </header>

        {isStatsLoading ? (
          <div className="text-center my-5">
            <Spinner animation="border" variant="info" />
          </div>
        ) : statsError ? (
          <Alert variant="danger">Failed to load dashboard stats: {statsError.message}</Alert>
        ) : (
          <Row className="g-4 mb-5">
          {stats.map((stat, i) => (
            <Col key={i} lg={3} md={6}>
              <motion.div 
                whileHover={{ y: -10 }}
                className={`stat-card-new ${stat.color}`}
                style={{ boxShadow: `0 10px 30px ${stat.shadow}` }}
              >
                <div className="stat-info">
                  <span className="stat-label">{stat.title}</span>
                  <h2 className="stat-number">{stat.value}</h2>
                </div>
                <div className="stat-icon-box">{stat.icon}</div>
              </motion.div>
            </Col>
          ))}
          </Row>
        )}

        {/* Table Section */}
        <div className="recent-section">
          <h3 className="section-title">Recent Subscriptions</h3>
          <div className="custom-table-wrapper">
            <div className="table-header-row">
              <div className="th-cell">DEVICE ID</div>
              <div className="th-cell">PLAN</div>
              <div className="th-cell">START DATE</div>
              <div className="th-cell">END DATE</div>
              <div className="th-cell text-center">STATUS</div>
            </div>

            {isSubsLoading ? (
              <div className="text-center my-3"><Spinner animation="border" variant="info" size="sm" /></div>
            ) : subsError ? (
              <Alert variant="danger" className="m-3">Failed to load recent subscriptions: {subsError.message}</Alert>
            ) : subsData?.content?.length === 0 ? (
              <div className="p-4 text-center text-muted">No recent subscriptions found.</div>
            ) : (
              subsData?.content?.map((sub, index) => (
                <motion.div 
                  key={sub.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="table-data-row"
                >
                  <div className="td-cell">
                    <div className="movie-info">
                      <FiPlay className="text-info me-2" />
                      <span className="text-truncate" style={{maxWidth: '120px'}} title={sub.deviceId}>
                        {sub.deviceId}
                      </span>
                    </div>
                  </div>
                  <div className="td-cell fw-bold">{sub.plan}</div>
                  <div className="td-cell text-muted">{new Date(sub.startDate).toLocaleDateString()}</div>
                  <div className="td-cell text-muted">{new Date(sub.endDate).toLocaleDateString()}</div>
                  <div className="td-cell text-center">
                    <Badge className={`status-pill ${sub.status.toLowerCase()}`}>
                      {sub.status}
                    </Badge>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;