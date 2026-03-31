import React, { useState, useMemo, useEffect } from 'react';
import { Row, Col, Badge, Image, Spinner, Alert, Button, Form, Modal } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiTrendingUp, FiDollarSign, FiPlay, FiActivity, FiTrash2, FiPlus, FiLogOut, FiMenu, FiChevronDown } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useSubscriptions, useCreateManualSubscription, useDeleteSubscription } from '../../hooks/useSubscriptions';
import { useAllPlans } from '../../hooks/usePlans';
import { useAuthContext } from '../../contexts/AuthContext';
import ColumnFilter from '../Shared/ColumnFilter';
import Sidebar from '../Shared/Sidebar';
import ConfirmModal from '../Shared/ConfirmModal';
import '../Dashboard/Dashboard.css';

const Subscriptions = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuthContext();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [page, setPage] = useState(0);
  const size = 20;
  
  // Filter states
  const [filters, setFilters] = useState({
    deviceId: '',
    plan: '',
    status: ''
  });
  
  const { data: subsData, isLoading, error } = useSubscriptions(page, size, filters);
  const createSubMutation = useCreateManualSubscription();
  const deleteSubMutation = useDeleteSubscription();
  const { data: allPlans = [], isLoading: isPlansLoading } = useAllPlans();

  const [showModal, setShowModal] = useState(false);
  const [modalPlanOpen, setModalPlanOpen] = useState(false);
  const [newSub, setNewSub] = useState({ deviceId: '', planId: '', plan: '' });
  const [confirmState, setConfirmState] = useState({ show: false, subId: null });

  // Reset to page 0 whenever filters change (required for server-side filtering)
  useEffect(() => {
    setPage(0);
  }, [filters]);

  const handleFilterChange = (column, value) => {
    setFilters(prev => ({ ...prev, [column]: value }));
  };

  const subscriptions = useMemo(() => {
    const raw = subsData?.content || [];
    if (!filters.deviceId && !filters.plan && !filters.status) return raw;
    
    return raw.filter(sub => {
      // Case-insensitive partial match for deviceId
      const matchDevice = !filters.deviceId || 
        (sub.deviceId || '').toLowerCase().includes(filters.deviceId.toLowerCase());
      // Case-insensitive exact match for plan
      const planVal = sub.plan || sub.planName || sub.subscriptionPlan || '';
      const matchPlan = !filters.plan || 
        planVal.toLowerCase() === filters.plan.toLowerCase();
      // Case-insensitive exact match for status
      const matchStatus = !filters.status || 
        (sub.status || '').toLowerCase() === filters.status.toLowerCase();
      return matchDevice && matchPlan && matchStatus;
    });
  }, [subsData, filters]);

  const handleCreate = (e) => {
    e.preventDefault();
    // Backend expects: { deviceId, plan } where plan is the plan name/type
    createSubMutation.mutate({ deviceId: newSub.deviceId, plan: newSub.plan }, {
      onSuccess: () => {
        setShowModal(false);
        setNewSub({ deviceId: '', planId: '', plan: '' });
        setModalPlanOpen(false);
      }
    });
  };

  const handleDelete = (id) => {
    setConfirmState({ show: true, subId: id });
  };

  const executeDelete = () => {
    if (confirmState.subId) {
      deleteSubMutation.mutate(confirmState.subId, {
        onSuccess: () => setConfirmState({ show: false, subId: null })
      });
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar 
        activePage="subscriptions" 
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
              <h1>Active <span className="highlight">Subscriptions</span></h1>
              <p>Manage user plans and manual overrides</p>
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
            <div className="table-header-row subs-table-grid">
              <div className="th-cell align-left">ID</div>
              <div className="th-cell align-left">
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
              <div className="th-cell align-left">START DATE</div>
              <div className="th-cell align-left">END DATE</div>
              <div className="th-cell align-right">AMOUNT</div>
              <div className="th-cell align-center">
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
            ) : subscriptions.length === 0 ? (
              <div className="p-4 text-center text-white">No subscriptions found.</div>
            ) : (
              subscriptions.map((sub, index) => (
                <motion.div 
                  key={sub.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="table-data-row align-items-center subs-table-grid"
                >
                  <div className="td-cell align-left text-white-50">#{sub.id}</div>
                  <div className="td-cell align-left fw-bold text-white px-2 wrap-text" title={sub.deviceId}>
                    {sub.deviceId}
                  </div>
                  <div className="td-cell align-left">{sub.plan || sub.planName || sub.subscriptionPlan}</div>
                  <div className="td-cell align-left text-white">{new Date(sub.startDate).toLocaleDateString()}</div>
                  <div className="td-cell align-left text-white">{new Date(sub.endDate).toLocaleDateString()}</div>
                  <div className="td-cell align-right fw-bold text-success">€{sub.amount || '0.00'}</div>
                  <div className="td-cell align-center">
                    <Badge className={`status-pill ${sub.status?.toLowerCase() || 'expired'}`}>
                      {sub.status}
                    </Badge>
                  </div>
                </motion.div>
              ))
            )}
          </div>
          
          {/* Pagination Controls — hidden when filters are active (all data loaded) */}
          {!filters.deviceId && !filters.plan && !filters.status && subsData && subsData.totalPages > 1 && (
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

      <Modal show={showModal} onHide={() => setShowModal(false)} centered className="dark-modal" size="lg">
        <Modal.Header closeButton className="border-secondary bg-dark text-white">
          <Modal.Title>Manual Subscription</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-white" style={{ minHeight: '400px' }}>
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
            <div className="custom-modal-select-wrapper mb-4">
              <Form.Label className="text-white-50 small mb-2">Select Subscription Plan</Form.Label>
              {isPlansLoading ? (
                <div className="text-center py-3"><Spinner animation="border" size="sm" variant="info" /></div>
              ) : (
                <div className={`custom-modal-select ${modalPlanOpen ? 'active' : ''}`} onClick={() => setModalPlanOpen(!modalPlanOpen)}>
                  <span className={newSub.planId ? 'text-white' : 'text-white-50'}>
                    {newSub.plan || 'Choose a plan...'}
                  </span>
                  <FiChevronDown className={`ms-auto transition-03 ${modalPlanOpen ? 'rotate-180' : ''}`} />
                  
                  <AnimatePresence>
                    {modalPlanOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="custom-modal-options"
                      >
                        {allPlans.filter(p => p.active).map(plan => (
                          <div 
                            key={plan.id}
                            className={`modal-option ${newSub.planId === plan.id ? 'selected' : ''}`}
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setNewSub({...newSub, planId: plan.id, plan: plan.name}); 
                              setModalPlanOpen(false); 
                            }}
                          >
                            <div className="fw-bold">{plan.name}</div>
                            <div className="small" style={{ opacity: 0.6 }}>{plan.durationDays} days · €{plan.price}</div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
            
            {createSubMutation.isError && (
              <Alert variant="danger py-2">{createSubMutation.error?.response?.data?.message || "Failed to create"}</Alert>
            )}

            <Button 
              variant="info" 
              type="submit" 
              className="w-100 text-white" 
              disabled={createSubMutation.isPending || !newSub.plan || !newSub.deviceId}
            >
              {createSubMutation.isPending ? "Creating..." : "Create Subscription"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      <ConfirmModal 
        show={confirmState.show}
        onHide={() => setConfirmState({ show: false, subId: null })}
        onConfirm={executeDelete}
        title="Delete Subscription?"
        message="Are you sure you want to delete this subscription? This action is permanent and the user will lose access immediately."
        confirmText="Delete"
        variant="danger"
        isLoading={deleteSubMutation.isPending}
      />
    </div>
  );
};

export default Subscriptions;
