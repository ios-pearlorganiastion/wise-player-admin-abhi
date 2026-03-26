import React, { useState, useMemo } from 'react';
import { Row, Col, Badge, Image, Spinner, Alert, Button, Form, Modal } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiTrendingUp, FiDollarSign, FiPlay, FiActivity, FiTrash2, FiPlus, FiLogOut } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useSubscriptions, useCreateManualSubscription, useDeleteSubscription } from '../../hooks/useSubscriptions';
import { useAuthContext } from '../../contexts/AuthContext';
import ColumnFilter from '../Shared/ColumnFilter';
import Sidebar from '../Shared/Sidebar';
import '../Dashboard/Dashboard.css';

const Subscriptions = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuthContext();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [page, setPage] = useState(0);
  const size = 20;
  
  const { data: subsData, isLoading, error } = useSubscriptions(page, size);
  const createSubMutation = useCreateManualSubscription();
  const deleteSubMutation = useDeleteSubscription();

  const [showModal, setShowModal] = useState(false);
  const [newSub, setNewSub] = useState({ deviceId: '', plan: 'ANNUAL' });

  // Filter states
  const [filters, setFilters] = useState({
    deviceId: '',
    plan: '',
    status: ''
  });

  const handleFilterChange = (column, value) => {
    setFilters(prev => ({ ...prev, [column]: value }));
  };

  const filteredSubs = useMemo(() => {
    if (!subsData?.content) return [];
    return subsData.content.filter(sub => {
      return (
        sub.deviceId.toLowerCase().includes(filters.deviceId.toLowerCase()) &&
        (filters.plan === '' || sub.plan === filters.plan) &&
        (filters.status === '' || sub.status === filters.status)
      );
    });
  }, [subsData, filters]);

  const handleCreate = (e) => {
    e.preventDefault();
    createSubMutation.mutate(newSub, {
      onSuccess: () => {
        setShowModal(false);
        setNewSub({ deviceId: '', plan: 'ANNUAL' });
      }
    });
  };

  const handleDelete = (id) => {
    if(window.confirm("Are you sure you want to delete this subscription?")) {
      deleteSubMutation.mutate(id);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar activePage="subscriptions" />

      <div className="content-area">
        <header className="dash-header">
          <div className="welcome-text">
            <h1>Active <span className="highlight">Subscriptions</span></h1>
            <p>Manage user plans and manual overrides</p>
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
                  className="admin-avatar m-0" 
                  roundedCircle
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

        <div className="action-row mb-4">
          <Button 
            variant="info" 
            className="fw-bold text-white shadow-sm px-4" 
            style={{ borderRadius: '12px', height: '48px' }} 
            onClick={() => setShowModal(true)}
          >
            <FiPlus className="me-2" style={{ fontSize: '1.2rem' }}/> Manual Subscription
          </Button>
        </div>

        <div className="recent-section">
          <div className="mb-3">
             <h3 className="section-title m-0">Subscription List</h3>
          </div>

          <div className="custom-table-wrapper" style={{ overflowX: 'auto' }}>
            <div className="table-header-row subs-table-grid" style={{ minWidth: '1000px' }}>
              <div className="th-cell">
                DEVICE ID <ColumnFilter column="deviceId" onFilterChange={handleFilterChange} placeholder="ID" />
              </div>
              <div className="th-cell">
                PLAN 
                <ColumnFilter 
                  column="plan" 
                  onFilterChange={handleFilterChange} 
                  placeholder="Plan" 
                  options={[{label: 'Annual', value: 'ANNUAL'}, {label: 'Lifetime', value: 'LIFETIME'},{label: 'TRIAL', value: 'TRIAL'}]}
                />
              </div>
              <div className="th-cell">START DATE</div>
              <div className="th-cell">END DATE</div>
              <div className="th-cell text-center">
                STATUS
                <ColumnFilter 
                  column="status" 
                  onFilterChange={handleFilterChange} 
                  placeholder="Status" 
                  options={[{label: 'Active', value: 'ACTIVE'}, {label: 'Trial', value: 'TRIAL'}, {label: 'Expired', value: 'EXPIRED'}, {label: 'Cancelled', value: 'CANCELLED'}]}
                  alignRight
                />
              </div>
            </div>

            {isLoading ? (
              <div className="text-center my-5"><Spinner animation="border" variant="info" /></div>
            ) : error ? (
              <Alert variant="danger" className="m-3">Error loading subscriptions: {error.message}</Alert>
            ) : filteredSubs.length === 0 ? (
              <div className="p-4 text-center text-white">No matching subscriptions found.</div>
            ) : (
              filteredSubs.map((sub, index) => (
                <motion.div 
                  key={sub.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="table-data-row align-items-center subs-table-grid"
                  style={{ minWidth: '1000px' }}
                >
                  <div className="td-cell fw-bold text-white px-2" title={sub.deviceId}>
                    {sub.deviceId}
                  </div>
                  <div className="td-cell">{sub.plan}</div>
                  <div className="td-cell text-white">{new Date(sub.startDate).toLocaleDateString()}</div>
                  <div className="td-cell text-white">{new Date(sub.endDate).toLocaleDateString()}</div>
                  <div className="td-cell text-center">
                    <Badge className={`status-pill ${sub.status?.toLowerCase() || 'expired'}`}>
                      {sub.status}
                    </Badge>
                  </div>
                </motion.div>
              ))
            )}
          </div>
          
          {/* Pagination Controls */}
          {subsData && subsData.totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <Button 
                variant="outline-info" 
                disabled={subsData.first} 
                onClick={() => setPage(p => Math.max(0, p - 1))}
              >
                Previous
              </Button>
              <span className="text-white">Page {page + 1} of {subsData.totalPages}</span>
              <Button 
                variant="outline-info" 
                disabled={subsData.last} 
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered className="dark-modal">
        <Modal.Header closeButton className="border-secondary bg-dark text-white">
          <Modal.Title>Manual Subscription</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-white">
          <Form onSubmit={handleCreate}>
            <Form.Group className="mb-3">
              <Form.Label>Device ID (UUID)</Form.Label>
              <Form.Control 
                type="text" 
                required 
                value={newSub.deviceId} 
                onChange={e => setNewSub({...newSub, deviceId: e.target.value})}
                className="bg-secondary text-white border-0"
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>Plan</Form.Label>
              <Form.Select 
                value={newSub.plan} 
                onChange={e => setNewSub({...newSub, plan: e.target.value})}
                className="bg-secondary text-white border-0"
              >
                <option value="ANNUAL">Annual</option>
                <option value="LIFETIME">Lifetime</option>
              </Form.Select>
            </Form.Group>
            
            {createSubMutation.isError && (
              <Alert variant="danger py-2">{createSubMutation.error?.response?.data?.message || "Failed to create"}</Alert>
            )}

            <Button variant="info" type="submit" className="w-100 text-white" disabled={createSubMutation.isPending}>
              {createSubMutation.isPending ? "Creating..." : "Create Subscription"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

    </div>
  );
};

export default Subscriptions;
