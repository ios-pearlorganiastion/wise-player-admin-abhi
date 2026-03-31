import React, { useState } from 'react';
import { Row, Col, Badge, Image, Spinner, Alert, Button, Table, Modal, Form } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTag, FiPlus, FiEdit2, FiPower, FiActivity, FiLogOut, FiPackage, FiMenu } from 'react-icons/fi';
import Sidebar from '../Shared/Sidebar';
import { usePlans, useCreatePlan, useUpdatePlan, useTogglePlanStatus } from '../../hooks/usePlans';
import { useAuthContext } from '../../contexts/AuthContext';
import ColumnFilter from '../Shared/ColumnFilter';
import Pagination from '../Shared/Pagination';
import ConfirmModal from '../Shared/ConfirmModal';
import '../Dashboard/Dashboard.css';

const Plans = () => {
  const { user, logout } = useAuthContext();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [page, setPage] = useState(0);
  const size = 20;
  const [planFilter, setPlanFilter] = useState('');

  const { data: plansData, isLoading, error } = usePlans(page, size);

  const filteredPlans = React.useMemo(() => {
    if (!plansData?.content) return [];
    return plansData.content.filter(plan => 
      !planFilter || plan.name?.toLowerCase().includes(planFilter.toLowerCase())
    );
  }, [plansData, planFilter]);
  const createMutation = useCreatePlan();
  const updateMutation = useUpdatePlan();
  const toggleStatusMutation = useTogglePlanStatus();

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    durationDays: '',
    price: '',
    currency: 'EUR',
    description: ''
  });

  const [confirmState, setConfirmState] = useState({ show: false, plan: null });

  const handleOpenModal = (plan = null) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        durationDays: plan.durationDays,
        price: plan.price,
        currency: plan.currency || 'EUR',
        description: plan.description || ''
      });
    } else {
      setEditingPlan(null);
      setFormData({
        name: '',
        durationDays: '',
        price: '',
        currency: 'EUR',
        description: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      durationDays: parseInt(formData.durationDays),
      price: parseFloat(formData.price)
    };

    if (editingPlan) {
      updateMutation.mutate({ id: editingPlan.id, plan: payload }, {
        onSuccess: () => setShowModal(false)
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => setShowModal(false)
      });
    }
  };

  const handleToggleStatus = (plan) => {
    setConfirmState({ show: true, plan });
  };

  const executeToggleStatus = () => {
    const { plan } = confirmState;
    if (plan) {
      toggleStatusMutation.mutate(plan.id, {
        onSuccess: () => setConfirmState({ show: false, plan: null })
      });
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar 
        activePage="plans" 
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
              <h1>Subscription <span className="highlight">Plans</span></h1>
              <p>Define and manage your service offerings</p>
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

        <div className="d-flex justify-content-between align-items-center mb-4 mt-4">
           <div className="d-flex align-items-center">
              <FiPackage className="text-info me-2 fs-3" />
              <h3 className="section-title m-0">Available Plans</h3>
           </div>
           <Button 
            variant="danger" 
            className="d-flex align-items-center gap-2 fw-bold px-4"
            style={{ borderRadius: '12px' }}
            onClick={() => handleOpenModal()}
           >
             <FiPlus /> Create New Plan
           </Button>
        </div>

        <div className="recent-section">
          {isLoading ? (
            <div className="text-center py-5"><Spinner animation="border" variant="danger" /></div>
          ) : error ? (
            <Alert variant="danger">Error loading plans: {error.message}</Alert>
          ) : (
            <div className="custom-table-wrapper" style={{ overflowX: 'auto' }}>
              <div className="table-header-row plan-table-grid">
                <div className="th-cell align-left">ID</div>
                <div className="th-cell align-left">
                  PLAN NAME
                  <ColumnFilter column="plan" onFilterChange={(_, val) => setPlanFilter(val)} placeholder="Plan Name" />
                </div>
                <div className="th-cell align-right">DURATION</div>
                <div className="th-cell align-right">PRICE</div>
                <div className="th-cell align-center">STATUS</div>
                <div className="th-cell align-center">ACTIONS</div>
              </div>

              {filteredPlans.map((plan, index) => (
                <motion.div 
                  key={plan.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="table-data-row align-items-center plan-table-grid"
                >
                  <div className="td-cell align-left text-white-50">#{plan.id}</div>
                  <div className="td-cell align-left fw-bold text-white px-2 wrap-text">
                    <FiTag className="text-danger me-2" />
                    {plan.name}
                  </div>
                  <div className="td-cell align-right text-white-50">{plan.durationDays} Days</div>
                  <div className="td-cell align-right">
                    <span className="text-info fw-bold">{plan.price}</span> {plan.currency}
                  </div>
                  <div className="td-cell align-center">
                    <Badge bg={plan.active ? "success" : "secondary"} className="status-pill">
                      {plan.active ? "ACTIVE" : "INACTIVE"}
                    </Badge>
                  </div>
                  <div className="td-cell align-center">
                    <Button variant="outline-info" size="sm" className="me-2" onClick={() => handleOpenModal(plan)} title="Edit">
                      <FiEdit2 />
                    </Button>
                    <Button 
                      variant={plan.active ? "outline-danger" : "outline-success"} 
                      size="sm"
                      onClick={() => handleToggleStatus(plan)}
                      disabled={toggleStatusMutation.isPending}
                      title={plan.active ? "Disable" : "Enable"}
                    >
                      <FiPower />
                    </Button>
                  </div>
                </motion.div>
              ))}
              
              {filteredPlans.length === 0 && (
                <div className="p-5 text-center text-white-50">No matching plans found.</div>
              )}
            </div>
          )}

          <Pagination 
            currentPage={page} 
            totalPages={plansData?.totalPages || 0} 
            onPageChange={setPage} 
          />
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered className="dark-modal">
        <Modal.Header closeButton className="bg-dark text-white border-secondary">
          <Modal.Title>{editingPlan ? 'Edit Plan' : 'Create New Plan'}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-white p-4">
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="text-white-50 small">Plan Name</Form.Label>
              <Form.Control 
                type="text" 
                required 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Annual Subscription"
                className="bg-secondary text-white border-0"
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-white-50 small">Duration (Days)</Form.Label>
                  <Form.Control 
                    type="number" 
                    required 
                    value={formData.durationDays}
                    onChange={e => setFormData({...formData, durationDays: e.target.value})}
                    placeholder="e.g. 365"
                    className="bg-secondary text-white border-0"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-white-50 small">Price</Form.Label>
                  <div className="d-flex gap-2">
                    <Form.Control 
                      type="number" 
                      step="0.01"
                      required 
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: e.target.value})}
                      placeholder="59.99"
                      className="bg-secondary text-white border-0"
                    />
                    <Form.Select 
                      value={formData.currency}
                      onChange={e => setFormData({...formData, currency: e.target.value})}
                      className="bg-secondary text-white border-0"
                      style={{ width: '100px' }}
                    >
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                      <option value="GBP">GBP</option>
                    </Form.Select>
                  </div>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label className="text-white-50 small">Description</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Briefly describe what this plan offers..."
                className="bg-secondary text-white border-0"
              />
            </Form.Group>

            <Button 
              variant="danger" 
              type="submit" 
              className="w-100 py-2 fw-bold fs-5"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? <Spinner animation="border" size="sm" /> : editingPlan ? 'Update Plan' : 'Create Plan'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      <ConfirmModal 
        show={confirmState.show}
        onHide={() => setConfirmState({ show: false, plan: null })}
        onConfirm={executeToggleStatus}
        title={confirmState.plan?.active ? 'Deactivate Plan?' : 'Activate Plan?'}
        message={`Are you sure you want to ${confirmState.plan?.active ? 'deactivate' : 'activate'} this subscription plan? Existing subscriptions will remain valid until expiry.`}
        confirmText={confirmState.plan?.active ? 'Deactivate' : 'Activate'}
        variant={confirmState.plan?.active ? 'danger' : 'info'}
        isLoading={toggleStatusMutation.isPending}
      />
    </div>
  );
};

export default Plans;
