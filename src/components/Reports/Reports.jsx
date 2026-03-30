import React, { useState } from 'react';
import { Row, Col, Badge, Image, Spinner, Alert, Form, Button, Card } from 'react-bootstrap';
import { FiCalendar, FiTrendingUp, FiUsers, FiStar, FiActivity, FiLogOut, FiBarChart2, FiMenu } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../Shared/Sidebar';
import { useRevenueReport, useDeviceReport, useSubscriptionReport, useResellerReport } from '../../hooks/useReports';
import { useAuthContext } from '../../contexts/AuthContext';
import '../Dashboard/Dashboard.css';

const Reports = () => {
  const { user, logout } = useAuthContext();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Date range defaults - last 30 days
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  const [fromDate, setFromDate] = useState(thirtyDaysAgo);
  const [toDate, setToDate] = useState(today);

  const { data: revenueData, isLoading: isRevLoading, error: revError } = useRevenueReport(fromDate, toDate);
  const { data: deviceData, isLoading: isDevLoading, error: devError } = useDeviceReport(fromDate, toDate);
  const { data: subData, isLoading: isSubLoading, error: subError } = useSubscriptionReport(fromDate, toDate);
  const { data: resellerData, isLoading: isResLoading, error: resError } = useResellerReport();

  const COLORS = ['#00F5FF', '#9B5CFF', '#39FF14', '#FFD700', '#FF7F50'];

  return (
    <div className="dashboard-container">
      <Sidebar 
        activePage="reports" 
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
              <h1>Reports & <span className="highlight">Analytics</span></h1>
              <p>Visual performance tracking and statistics</p>
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
                  src={`https://ui-avatars.com/api/?name=${user?.fullName || 'Admin'}&background=00F5FF&color=000`} 
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
                       <div className="small text-white">{user?.role}</div>
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

        {/* Date Filters Area */}
        <div className="recent-section mb-4 p-4">
          <Row className="align-items-center">
            <Col md={4} className="d-flex align-items-center mb-3 mb-md-0">
              <FiCalendar className="text-info me-3 fs-3" />
              <div>
                <label className="text-white-50 d-block small">From Date</label>
                <Form.Control 
                  type="date" 
                  value={fromDate} 
                  onChange={(e) => setFromDate(e.target.value)}
                  className="bg-dark text-white border-secondary"
                />
              </div>
            </Col>
            <Col md={4} className="d-flex align-items-center mb-3 mb-md-0">
               <FiCalendar className="text-info me-3 fs-3" />
               <div>
                <label className="text-white-50 d-block small">To Date</label>
                <Form.Control 
                  type="date" 
                  value={toDate} 
                  onChange={(e) => setToDate(e.target.value)}
                  className="bg-dark text-white border-secondary"
                />
              </div>
            </Col>
            <Col md={4} className="text-end">
               <div className="small text-white-50">Range: {new Date(fromDate).toLocaleDateString()} - {new Date(toDate).toLocaleDateString()}</div>
            </Col>
          </Row>
        </div>

        <Row className="g-4">
          {/* Revenue Overview Card */}
          <Col lg={4}>
            <div className="recent-section h-100">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="section-title m-0"><FiTrendingUp className="me-2 text-danger" /> Revenue</h3>
                {isRevLoading && <Spinner animation="border" variant="danger" size="sm" />}
              </div>
              
              {revError ? (
                <Alert variant="danger" className="py-2">Failed to load revenue</Alert>
              ) : (
                <div className="text-center py-3">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h2 className="display-4 fw-bold highlight mb-0">€{Number(revenueData?.totalRevenue || 0).toFixed(2)}</h2>
                    <p className="text-white-50 mt-1">Total Period Revenue</p>
                  </motion.div>
                  
                  <div className="mt-4 pt-2 border-top border-secondary d-flex justify-content-around">
                    <div className="text-center">
                       <div className="small text-white-50 mb-1">Successful</div>
                       <Badge bg="success" className="p-2 px-3 fs-6">{revenueData?.successfulPayments || 0}</Badge>
                    </div>
                    <div className="text-center">
                       <div className="small text-white-50 mb-1">Failed</div>
                       <Badge bg="danger" className="p-2 px-3 fs-6">{revenueData?.failedPayments || 0}</Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Col>

          {/* Registrations Card */}
          <Col lg={4}>
            <div className="recent-section h-100">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="section-title m-0"><FiUsers className="me-2 text-info" /> Registrations</h3>
                {isDevLoading && <Spinner animation="border" variant="info" size="sm" />}
              </div>
              
              {devError ? (
                <Alert variant="danger" className="py-2">Failed to load devices</Alert>
              ) : (
                <div className="text-center py-4">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <h2 className="display-4 fw-bold text-info mb-0">{deviceData?.newDevices || 0}</h2>
                    <p className="text-white-50 mt-2">New Registrations</p>
                  </motion.div>
                  <div className="mt-5 text-info-50 small">
                    <FiActivity className="me-1" /> Active Device Growth
                  </div>
                </div>
              )}
            </div>
          </Col>

          {/* Subscriptions Card */}
          <Col lg={4}>
            <div className="recent-section h-100">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="section-title m-0"><FiStar className="me-2 text-warning" /> Subscriptions</h3>
                {isSubLoading && <Spinner animation="border" variant="warning" size="sm" />}
              </div>
              
              {subError ? (
                <Alert variant="danger" className="py-2">Failed to load subscriptions</Alert>
              ) : (
                <div className="text-center py-4">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <h2 className="display-4 fw-bold text-warning mb-0">{subData?.newSubscriptions || 0}</h2>
                    <p className="text-white-50 mt-2">New Active Subscriptions</p>
                  </motion.div>
                  <div className="mt-5 text-warning-50 small">
                    <FiStar className="me-1" /> Revenue Contributing Subs
                  </div>
                </div>
              )}
            </div>
          </Col>

          {/* Resellers Table */}
          <Col lg={12}>
            <div className="recent-section mt-2">
              <h3 className="section-title mb-4"><FiBarChart2 className="me-2 text-success" /> Reseller Performance</h3>
              {isResLoading ? (
                 <div className="text-center py-5"><Spinner animation="border" variant="success" /></div>
              ) : resError ? (
                <Alert variant="danger">Error loading reseller data</Alert>
              ) : (
                <div className="custom-table-wrapper">
                  <div className="table-header-row reseller-table-grid">
                    <div className="th-cell align-left">RESELLER</div>
                    <div className="th-cell align-right">TOTAL USERS</div>
                    <div className="th-cell align-right">ACTIVE USERS</div>
                    <div className="th-cell align-center">PENDING REQ</div>
                  </div>
                  {(resellerData || []).map((res, i) => (
                    <motion.div 
                      key={res.id || i} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="table-data-row reseller-table-grid" 
                    >
                      <div className="td-cell align-left wrap-text text-white fw-bold">
                        <div className="movie-info px-2">
                           <FiUsers className="text-success me-2" />
                           {res.fullName} <span className="small text-white-50 ms-2">@{res.username}</span>
                        </div>
                      </div>
                      <div className="td-cell align-right">{res.totalUsers || 0}</div>
                      <div className="td-cell align-right text-info">{res.activeUsers || 0}</div>
                      <div className="td-cell align-center">
                        <Badge bg={res.pendingRequests > 0 ? "warning" : "dark"} className="p-2 border border-secondary text-white">
                           {res.pendingRequests || 0}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                  {(!resellerData || resellerData.length === 0) && (
                    <div className="p-4 text-center text-white-50">No reseller data available</div>
                  )}
                </div>
              )}
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Reports;
