import React, { useState } from 'react';
import { Row, Col, Badge, Image, Spinner, Alert, Button } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiTrendingUp, FiDollarSign, FiPlay, FiActivity, FiLogOut } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { usePayments, usePaymentStats } from '../../hooks/usePayments';
import { useAuthContext } from '../../contexts/AuthContext';
import '../Dashboard/Dashboard.css';

const Payments = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuthContext();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [page, setPage] = useState(0);
  const size = 10;
  
  const { data: paymentsData, isLoading: isPaymentsLoading, error: paymentsError } = usePayments(page, size);
  const { data: statsData, isLoading: isStatsLoading, error: statsError } = usePaymentStats();

  const stats = [
    { title: "Total Revenue", value: `${statsData?.totalRevenue || 0} €`, icon: <FiDollarSign />, color: "n-blue", shadow: "rgba(0, 212, 255, 0.4)" },
    { title: "Successful Transactions", value: statsData?.successfulTransactions || 0, icon: <FiTrendingUp />, color: "n-green", shadow: "rgba(57, 255, 20, 0.4)" },
    { title: "Total Transactions", value: statsData?.totalTransactions || 0, icon: <FiActivity />, color: "n-yellow", shadow: "rgba(255, 215, 0, 0.4)" },
  ];

  return (
    <div className="dashboard-container">
      {/* Sidebar - Reused layout structure */}
      <div className="glass-sidebar">
        <div className="logo-box">WP</div>
        <nav className="nav-links">
          <div className="nav-item" onClick={() => navigate('/dashboard')} style={{cursor: 'pointer'}}><FiPlay /></div>
          <div className="nav-item" onClick={() => navigate('/devices')} style={{cursor: 'pointer'}}><FiUsers /></div>
          <div className="nav-item active"><FiDollarSign /></div>
          <div className="nav-item" onClick={() => navigate('/subscriptions')} style={{cursor: 'pointer'}}><FiTrendingUp /></div>
        </nav>
      </div>

      <div className="content-area">
        <header className="dash-header">
          <div className="welcome-text">
            <h1>Revenue & <span className="highlight">Payments</span></h1>
            <p>Track all transactions and revenue metrics</p>
          </div>
          <div className="profile-section">
            <div className="notif-bell"><FiActivity /></div>
            
            <div className="profile-dropdown-container">
              <div 
                className={`profile-avatar-trigger ${showProfileMenu ? 'active' : ''}`}
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <Image 
                  src="https://ui-avatars.com/api/?name=Admin&background=E50914&color=fff" 
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
                      <div className="fw-bold text-white">{user?.fullName || 'Admin'}</div>
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

        {isStatsLoading ? (
          <div className="text-center my-4"><Spinner animation="border" variant="info" /></div>
        ) : statsError ? (
          <Alert variant="danger" className="mb-4">Error loading stats: {statsError.message}</Alert>
        ) : (
          <Row className="g-4 mb-4">
            {stats.map((stat, i) => (
              <Col key={i} lg={4} md={12}>
                <motion.div 
                  whileHover={{ y: -5 }}
                  className={`stat-card-new ${stat.color}`}
                  style={{ boxShadow: `0 8px 25px ${stat.shadow}`, minHeight: '120px' }}
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

        <div className="recent-section">
          <h3 className="section-title">Transactions</h3>
          <div className="custom-table-wrapper" style={{ overflowX: 'auto' }}>
            <div className="table-header-row payment-table-grid" style={{ minWidth: '1100px' }}>
              <div className="th-cell">TRANSACTION ID</div>
              <div className="th-cell">AMOUNT</div>
              <div className="th-cell">METHOD</div>
              <div className="th-cell">DATE</div>
              <div className="th-cell">TIME</div>
              <div className="th-cell text-center">STATUS</div>
            </div>

            {isPaymentsLoading ? (
              <div className="text-center my-5"><Spinner animation="border" variant="info" /></div>
            ) : paymentsError ? (
              <Alert variant="danger" className="m-3">Error loading payments: {paymentsError.message}</Alert>
            ) : paymentsData?.content?.length === 0 ? (
              <div className="p-4 text-center text-muted">No transactions found.</div>
            ) : (
              paymentsData?.content?.map((payment, index) => (
                <motion.div 
                  key={payment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="table-data-row align-items-center payment-table-grid"
                  style={{ minWidth: '1100px' }}
                >
                  <div className="td-cell fw-bold text-white" title={payment.paypalOrderId || payment.paymentId || payment.id}>
                    {payment.paypalOrderId || (payment.paymentId ? payment.paymentId : 'N/A')}
                  </div>
                  <div className="td-cell">{payment.amount} €</div>
                  <div className="td-cell">{payment.paypalOrderId ? 'PayPal' : (payment.paymentMethod || 'N/A')}</div>
                  <div className="td-cell text-white">{new Date(payment.createdAt).toLocaleDateString()}</div>
                  <div className="td-cell text-white">{new Date(payment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  <div className="td-cell text-center">
                    <Badge className={`status-pill ${payment.status?.toLowerCase() || 'pending'}`}>
                      {payment.status}
                    </Badge>
                  </div>
                </motion.div>
              ))
            )}
          </div>
          
          {/* Pagination Controls */}
          {paymentsData && paymentsData.totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <Button 
                variant="outline-info" 
                disabled={paymentsData.first} 
                onClick={() => setPage(p => Math.max(0, p - 1))}
              >
                Previous
              </Button>
              <span className="text-white">Page {page + 1} of {paymentsData.totalPages}</span>
              <Button 
                variant="outline-info" 
                disabled={paymentsData.last} 
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payments;
