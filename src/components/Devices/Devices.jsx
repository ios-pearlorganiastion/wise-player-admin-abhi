import React, { useState } from 'react';
import { Row, Col, Badge, Image, Spinner, Alert, Button } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiTrendingUp, FiDollarSign, FiPlay, FiActivity, FiShield, FiLogOut } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useDevices, useUpdateDeviceStatus } from '../../hooks/useDevices';
import { useAuthContext } from '../../contexts/AuthContext';
import '../Dashboard/Dashboard.css'; // Reusing Dashboard styles

const Devices = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuthContext();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [page, setPage] = useState(0);
  const size = 10;
  
  const { data: devicesData, isLoading, error } = useDevices(page, size);
  const updateStatusMutation = useUpdateDeviceStatus();

  const handleStatusToggle = (deviceId, currentStatus) => {
    const newStatus = currentStatus === "ACTIVE" ? "BLOCKED" : "ACTIVE";
    // Need to strictly pass what the API expects
    updateStatusMutation.mutate({ deviceId, status: newStatus });
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar - Reused layout structure */}
      <div className="glass-sidebar">
        <div className="logo-box">WP</div>
        <nav className="nav-links">
          <div className="nav-item" onClick={() => navigate('/dashboard')}><FiPlay /></div>
          <div className="nav-item active"><FiUsers /></div>
          <div className="nav-item" onClick={() => navigate('/payments')}><FiDollarSign /></div>
          <div className="nav-item" onClick={() => navigate('/subscriptions')}><FiTrendingUp /></div>
        </nav>
      </div>

      <div className="content-area">
        <header className="dash-header">
          <div className="welcome-text">
            <h1>Manage <span className="highlight">Devices</span></h1>
            <p>View and manage registered user devices</p>
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

        <div className="recent-section mt-4">
          <h3 className="section-title">Device List</h3>
          <div className="custom-table-wrapper" style={{ overflowX: 'auto' }}>
            <div className="table-header-row device-table-grid" style={{ minWidth: '1600px' }}>
              <div className="th-cell">DEVICE ID</div>
              <div className="th-cell">STATUS</div>
              <div className="th-cell">SUBSCRIPTION</div>
              <div className="th-cell">MODEL</div>
              <div className="th-cell">OS VERSION</div>
              <div className="th-cell">PLATFORM</div>
              <div className="th-cell">REGISTERED DATE</div>
              <div className="th-cell">LAST SEEN</div>
              <div className="th-cell">EXPIRES AT</div>
              <div className="th-cell text-center">ACTION</div>
            </div>

            {isLoading ? (
              <div className="text-center my-5"><Spinner animation="border" variant="info" /></div>
            ) : error ? (
              <Alert variant="danger" className="m-3">Error loading devices: {error.message}</Alert>
            ) : devicesData?.content?.length === 0 ? (
              <div className="p-4 text-center text-muted">No devices found.</div>
            ) : (
              devicesData?.content?.map((device, index) => (
                <motion.div 
                  key={device.deviceId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="table-data-row align-items-center device-table-grid"
                  style={{ minWidth: '1600px' }}
                >
                  <div className="td-cell fw-bold text-white" title={device.deviceId}>{device.deviceId}</div>
                  <div className="td-cell">
                    <Badge className={`status-pill ${(device.deviceStatus)?.toLowerCase() || 'inactive'}`}>
                      {device.deviceStatus}
                    </Badge>
                  </div>
                  <div className="td-cell">{device.subscriptionType}</div>
                  <div className="td-cell">{device.deviceModel}</div>
                  <div className="td-cell">{device.osVersion}</div>
                  <div className="td-cell">{device.platform}</div>
                  <div className="td-cell text-white">{device.registeredAt ? new Date(device.registeredAt).toLocaleDateString() : 'N/A'}</div>
                  <div className="td-cell text-white">{device.lastSeenAt ? new Date(device.lastSeenAt).toLocaleString() : 'N/A'}</div>
                  <div className="td-cell text-white">{device.expiresAt ? new Date(device.expiresAt).toLocaleDateString() : 'N/A'}</div>
                  <div className="td-cell text-center">
                    <Button 
                      variant={(device.deviceStatus || device.status) === "ACTIVE" ? "outline-danger" : "outline-success"} 
                      size="sm"
                      disabled={updateStatusMutation.isPending}
                      onClick={() => handleStatusToggle(device.deviceId || device.id, device.deviceStatus || device.status)}
                    >
                      <FiShield className="me-1" />
                      {(device.deviceStatus || device.status) === "ACTIVE" ? "Block" : "Activate"}
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
          
          {/* Pagination Controls */}
          {devicesData && devicesData.totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <Button 
                variant="outline-info" 
                disabled={devicesData.first} 
                onClick={() => setPage(p => Math.max(0, p - 1))}
              >
                Previous
              </Button>
              <span className="text-white">Page {page + 1} of {devicesData.totalPages}</span>
              <Button 
                variant="outline-info" 
                disabled={devicesData.last} 
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

export default Devices;
