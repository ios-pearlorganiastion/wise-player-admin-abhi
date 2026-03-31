import React, { useState, useMemo } from 'react';
import { Row, Col, Badge, Image, Spinner, Alert, Button } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiTrendingUp, FiDollarSign, FiPlay, FiActivity, FiShield, FiLogOut, FiMenu } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useDevices, useUpdateDeviceStatus } from '../../hooks/useDevices';
import { useAuthContext } from '../../contexts/AuthContext';
import ColumnFilter from '../Shared/ColumnFilter';
import Sidebar from '../Shared/Sidebar';
import ConfirmModal from '../Shared/ConfirmModal';
import '../Dashboard/Dashboard.css';

const Devices = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuthContext();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [page, setPage] = useState(0);
  const size = 20; // Increase size for client-side filtering demo or implement server-side
  
  const { data: devicesData, isLoading, error } = useDevices(page, size);
  const updateStatusMutation = useUpdateDeviceStatus();

  const [confirmState, setConfirmState] = useState({ show: false, device: null });

  // Filter states
  const [filters, setFilters] = useState({
    deviceId: '',
    status: '',
    subscription: '',
    model: '',
    platform: ''
  });

  const handleFilterChange = (column, value) => {
    setFilters(prev => ({ ...prev, [column]: value }));
  };

  const filteredDevices = useMemo(() => {
    if (!devicesData?.content) return [];
    return devicesData.content.filter(device => {
      return (
        device.deviceId.toLowerCase().includes(filters.deviceId.toLowerCase()) &&
        (filters.status === '' || device.deviceStatus === filters.status) &&
        (filters.subscription === '' || device.subscriptionType?.toLowerCase().includes(filters.subscription.toLowerCase())) &&
        (filters.model === '' || device.deviceModel?.toLowerCase().includes(filters.model.toLowerCase())) &&
        (filters.platform === '' || device.platform?.toLowerCase().includes(filters.platform.toLowerCase()))
      );
    });
  }, [devicesData, filters]);

  const handleStatusToggle = (deviceId, currentStatus) => {
    const device = filteredDevices.find(d => (d.deviceId || d.id) === deviceId);
    setConfirmState({ show: true, device: { ...device, deviceId, currentStatus } });
  };

  const executeStatusToggle = () => {
    const { device } = confirmState;
    if (device) {
      const newStatus = device.currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      updateStatusMutation.mutate(
        { deviceId: device.deviceId, status: newStatus },
        { onSuccess: () => setConfirmState({ show: false, device: null }) }
      );
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar 
        activePage="devices" 
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
              <h1>Manage <span className="highlight">Devices</span></h1>
              <p>View and manage registered user devices</p>
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
            <h3 className="section-title m-0">Device List</h3>
            <Badge bg="dark" className="text-info border border-secondary px-3 py-2">
              Showing {filteredDevices.length} devices
            </Badge>
          </div>

          <div className="custom-table-wrapper" style={{ overflowX: 'auto' }}>
            <div className="table-header-row device-table-grid">
              <div className="th-cell align-left">
                DEVICE ID <ColumnFilter column="deviceId" onFilterChange={handleFilterChange} placeholder="ID" />
              </div>
              <div className="th-cell align-center">
                STATUS 
                <ColumnFilter 
                  column="status" 
                  onFilterChange={handleFilterChange} 
                  placeholder="Status" 
                  options={[{label: 'Active', value: 'ACTIVE'}, {label: 'INACTIVE', value: 'INACTIVE'}]}
                />
              </div>
              <div className="th-cell align-left">
                SUBS <ColumnFilter column="subscription" onFilterChange={handleFilterChange} placeholder="Subscription" />
              </div>
              <div className="th-cell align-left">
                MODEL <ColumnFilter column="model" onFilterChange={handleFilterChange} placeholder="Model" />
              </div>
              <div className="th-cell align-left">OS VERSION</div>
              <div className="th-cell align-left">
                PLAT <ColumnFilter column="platform" onFilterChange={handleFilterChange} placeholder="Platform" />
              </div>
              <div className="th-cell align-left">REGISTERED DATE</div>
              <div className="th-cell align-center">ACTION</div>
            </div>

            {isLoading ? (
              <div className="text-center my-5"><Spinner animation="border" variant="info" /></div>
            ) : error ? (
              <Alert variant="danger" className="m-3">Error loading devices: {error.message}</Alert>
            ) : filteredDevices.length === 0 ? (
              <div className="p-4 text-center text-white">No matching devices found.</div>
            ) : (
              filteredDevices.map((device, index) => (
                <motion.div 
                  key={device.deviceId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="table-data-row align-items-center device-table-grid"
                >
                  <div className="td-cell align-left fw-bold text-white px-2 wrap-text" title={device.deviceId}>{device.deviceId}</div>
                  <div className="td-cell align-center">
                    <Badge className={`status-pill ${(device.deviceStatus)?.toLowerCase() || 'inactive'}`}>
                      {device.deviceStatus}
                    </Badge>
                  </div>
                  <div className="td-cell align-left">{device.subscriptionType}</div>
                  <div className="td-cell align-left">{device.deviceModel}</div>
                  <div className="td-cell align-left">{device.osVersion}</div>
                  <div className="td-cell align-left">{device.platform}</div>
                  <div className="td-cell align-left text-white">{device.registeredAt ? new Date(device.registeredAt).toLocaleDateString() : 'N/A'}</div>
                  <div className="td-cell align-center">
                    <Button 
                      variant={(device.deviceStatus || device.status) === "ACTIVE" ? "outline-danger" : "outline-success"} 
                      size="sm"
                      disabled={updateStatusMutation.isPending}
                      onClick={() => handleStatusToggle(device.deviceId || device.id, device.deviceStatus || device.status)}
                    >
                      <FiShield className="me-1" />
                      {(device.deviceStatus || device.status) === "ACTIVE" ? "Deactivate" : "Activate"}
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

      <ConfirmModal 
        show={confirmState.show}
        onHide={() => setConfirmState({ show: false, device: null })}
        onConfirm={executeStatusToggle}
        title={confirmState.device?.currentStatus === 'ACTIVE' ? 'Deactivate Device?' : 'Activate Device?'}
        message={`Are you sure you want to ${confirmState.device?.currentStatus === 'ACTIVE' ? 'deactivate' : 'activate'} this device? This will affect its connectivity to the platform.`}
        confirmText={confirmState.device?.currentStatus === 'ACTIVE' ? 'Deactivate' : 'Activate'}
        variant={confirmState.device?.currentStatus === 'ACTIVE' ? 'danger' : 'info'}
        isLoading={updateStatusMutation.isPending}
      />
    </div>
  );
};

export default Devices;
