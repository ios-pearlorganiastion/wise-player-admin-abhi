import React, { useState, useMemo } from 'react';
import { Badge, Spinner, Alert, Button, Image } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUserCheck, FiActivity, FiLogOut, FiShield, FiMenu } from 'react-icons/fi';
import { useDevices, useUpdateDeviceStatus } from '../../hooks/useDevices';
import { useAuthContext } from '../../contexts/AuthContext';
import ColumnFilter from '../Shared/ColumnFilter';
import Pagination from '../Shared/Pagination';
import Sidebar from '../Shared/Sidebar';
import ConfirmModal from '../Shared/ConfirmModal';
import '../Dashboard/Dashboard.css';

const Users = () => {
  const { logout, user } = useAuthContext();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [page, setPage] = useState(0);
  const size = 20;
  const [accountFilter, setAccountFilter] = useState('');
  
  const { data: devicesData, isLoading, error } = useDevices(page, size);

  const [confirmState, setConfirmState] = useState({ show: false, device: null });

  const filteredDevices = useMemo(() => {
    if (!devicesData?.content) return [];
    return devicesData.content.filter(dev => 
      !accountFilter || 
      dev.deviceId?.toLowerCase().includes(accountFilter.toLowerCase()) ||
      (dev.macAddress && dev.macAddress.toLowerCase().includes(accountFilter.toLowerCase()))
    );

  }, [devicesData, accountFilter]);
  const updateStatusMutation = useUpdateDeviceStatus();

  const handleToggleStatus = (dev) => {
    setConfirmState({ show: true, device: dev });
  };

  const executeToggleStatus = () => {
    const { device } = confirmState;
    if (device) {
      updateStatusMutation.mutate(
        { deviceId: device.deviceId, status: device.deviceStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' },
        { onSuccess: () => setConfirmState({ show: false, device: null }) }
      );
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar 
        activePage="users" 
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
              <h1>Platform <span className="highlight">Users</span></h1>
              <p>Manage access levels and account status for all platform users</p>
            </div>
          </div>
          <div className="profile-section">
            <div className="profile-dropdown-container">
              <div 
                className={`profile-avatar-trigger ${showProfileMenu ? 'active' : ''}`}
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <Image 
                  src={`https://ui-avatars.com/api/?name=${user?.fullName || 'Admin'}&background=E50914&color=fff`} 
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

        <div className="recent-section mt-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="section-title m-0">User Accounts</h3>
            <Badge bg="dark" className="text-info border border-secondary px-3 py-2">
              Showing {devicesData?.content?.length || 0} users
            </Badge>
          </div>

          <div className="custom-table-wrapper" style={{ overflowX: 'auto' }}>
            <div className="table-header-row user-table-grid">
              <div className="th-cell align-left">
                MAC ADDRESS
                <ColumnFilter column="account" onFilterChange={(_, val) => setAccountFilter(val)} placeholder="MAC/ID" />
              </div>

              <div className="th-cell align-left">REGISTERED ON</div>
              <div className="th-cell align-center">STATUS</div>
              <div className="th-cell align-center">ACTION</div>
            </div>

            {isLoading ? (
              <div className="text-center my-5"><Spinner animation="border" variant="info" /></div>
            ) : error ? (
              <Alert variant="danger" className="m-3">Error loading users: {error.message}</Alert>
            ) : devicesData?.content?.length === 0 ? (
              <div className="p-4 text-center text-white">No users found.</div>
            ) : filteredDevices.length === 0 ? (
              <div className="p-4 text-center text-white">No users match your filters.</div>
            ) : (
              filteredDevices.map((dev, index) => (
                <motion.div 
                  key={dev.deviceId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="table-data-row align-items-center user-table-grid"
                >
                  <div className="td-cell align-left px-2 wrap-text">
                    <div className="fw-bold text-white" title={dev.macAddress}>
                      {dev.macAddress || <span className="text-secondary fst-italic">N/A</span>}
                    </div>
                  </div>

                  <div className="td-cell align-left text-white">{new Date(dev.registeredAt).toLocaleDateString()}</div>
                  <div className="td-cell align-center">
                    <Badge className={`status-pill ${dev.deviceStatus.toLowerCase()}`}>
                      {dev.deviceStatus}
                    </Badge>
                  </div>
                  <div className="td-cell align-center">
                    <Button 
                      variant={dev.deviceStatus === "ACTIVE" ? "outline-danger" : "outline-success"} 
                      size="sm"
                      onClick={() => handleToggleStatus(dev)}
                    >
                      <FiShield className="me-1" />
                      {dev.deviceStatus === "ACTIVE" ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
          
          <Pagination 
            currentPage={page} 
            totalPages={devicesData?.totalPages || 0} 
            onPageChange={setPage} 
          />
        </div>
      </div>

      <ConfirmModal 
        show={confirmState.show}
        onHide={() => setConfirmState({ show: false, device: null })}
        onConfirm={executeToggleStatus}
        title={confirmState.device?.deviceStatus === 'ACTIVE' ? 'Deactivate User?' : 'Activate User?'}
        message={`Are you sure you want to ${confirmState.device?.deviceStatus === 'ACTIVE' ? 'deactivate' : 'activate'} this user account? This will affect their ability to access the platform.`}
        confirmText={confirmState.device?.deviceStatus === 'ACTIVE' ? 'Deactivate' : 'Activate'}
        variant={confirmState.device?.deviceStatus === 'ACTIVE' ? 'danger' : 'info'}
        isLoading={updateStatusMutation.isPending}
      />
    </div>
  );
};

export default Users;
