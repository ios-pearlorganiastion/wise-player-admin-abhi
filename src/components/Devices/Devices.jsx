import React, { useState } from 'react';
import { Row, Col, Badge, Image, Spinner, Alert, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FiUsers, FiTrendingUp, FiDollarSign, FiPlay, FiActivity, FiShield } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useDevices, useUpdateDeviceStatus } from '../../hooks/useDevices';
import '../Dashboard/Dashboard.css'; // Reusing Dashboard styles

const Devices = () => {
  const navigate = useNavigate();
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
            <Image src="https://i.pravatar.cc/150?u=admin" roundedCircle className="admin-avatar" />
          </div>
        </header>

        <div className="recent-section mt-4">
          <h3 className="section-title">Device List</h3>
          <div className="custom-table-wrapper">
            <div className="table-header-row">
              <div className="th-cell">MAC ADDRESS</div>
              <div className="th-cell">MODEL</div>
              <div className="th-cell">REGISTERED DATE</div>
              <div className="th-cell text-center">STATUS</div>
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
                  key={device.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="table-data-row align-items-center"
                >
                  <div className="td-cell fw-bold">{device.macAddress}</div>
                  <div className="td-cell">{device.deviceModel || 'Unknown'}</div>
                  <div className="td-cell text-muted">{new Date(device.createdAt).toLocaleDateString()}</div>
                  <div className="td-cell text-center">
                    <Badge className={`status-pill ${device.status?.toLowerCase() || 'inactive'}`}>
                      {device.status}
                    </Badge>
                  </div>
                  <div className="td-cell text-center">
                    <Button 
                      variant={device.status === "ACTIVE" ? "outline-danger" : "outline-success"} 
                      size="sm"
                      disabled={updateStatusMutation.isPending}
                      onClick={() => handleStatusToggle(device.id, device.status)}
                    >
                      <FiShield className="me-1" />
                      {device.status === "ACTIVE" ? "Block" : "Activate"}
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
