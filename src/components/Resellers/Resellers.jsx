import React, { useState, useMemo } from 'react';
import { Row, Col, Badge, Image, Spinner, Alert, Button, Modal, Form } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUserPlus, FiActivity, FiShield, FiLogOut, FiEdit2, FiMail, FiUser, FiCalendar, FiMenu } from 'react-icons/fi';
import { useResellers, useToggleResellerStatus, useCreateReseller, useUpdateReseller } from '../../hooks/useResellers';
import { useAuthContext } from '../../contexts/AuthContext';
import ColumnFilter from '../Shared/ColumnFilter';
import Pagination from '../Shared/Pagination';
import Sidebar from '../Shared/Sidebar';
import ConfirmModal from '../Shared/ConfirmModal';
import '../Dashboard/Dashboard.css';

const Resellers = () => {
  const { logout, user } = useAuthContext();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [page, setPage] = useState(0);
  const size = 20;
  
  const { data: resellersData, isLoading, error } = useResellers(page, size);
  const createMutation = useCreateReseller();
  const updateMutation = useUpdateReseller();
  const toggleStatusMutation = useToggleResellerStatus();

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingReseller, setEditingReseller] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    password: ''
  });

  const [confirmState, setConfirmState] = useState({ show: false, reseller: null });

  // Filter state
  const [usernameFilter, setUsernameFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');

  const filteredResellers = useMemo(() => {
    if (!resellersData?.content) return [];
    return resellersData.content.filter(reseller => {
      const matchUsername = !usernameFilter || reseller.username?.toLowerCase().includes(usernameFilter.toLowerCase());
      const matchName = !nameFilter || reseller.fullName?.toLowerCase().includes(nameFilter.toLowerCase());
      const matchEmail = !emailFilter || reseller.email?.toLowerCase().includes(emailFilter.toLowerCase());
      return matchUsername && matchName && matchEmail;
    });
  }, [resellersData, usernameFilter, nameFilter, emailFilter]);

  const handleOpenModal = (reseller = null) => {
    if (reseller) {
      setEditingReseller(reseller);
      setFormData({
        username: reseller.username,
        fullName: reseller.fullName,
        email: reseller.email || '',
        password: '' // Don't populate password
      });
    } else {
      setEditingReseller(null);
      setFormData({
        username: '',
        fullName: '',
        email: '',
        password: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingReseller) {
      const updatePayload = {
        fullName: formData.fullName,
        email: formData.email
      };
      if (formData.password) updatePayload.password = formData.password;
      
      updateMutation.mutate({ id: editingReseller.id, reseller: updatePayload }, {
        onSuccess: () => setShowModal(false)
      });
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => setShowModal(false)
      });
    }
  };

  const handleStatusToggle = (reseller) => {
    setConfirmState({ show: true, reseller });
  };

  const executeStatusToggle = () => {
    const { reseller } = confirmState;
    if (reseller) {
      toggleStatusMutation.mutate(reseller.id, {
        onSuccess: () => setConfirmState({ show: false, reseller: null })
      });
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar 
        activePage="resellers" 
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
              <h1>Manage <span className="highlight">Resellers</span></h1>
              <p>Admin control for reseller and sub-reseller accounts</p>
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

        <div className="d-flex justify-content-between align-items-center mt-4 mb-3">
          <div className="d-flex gap-3 align-items-center">
            <h3 className="section-title m-0">Reseller Accounts</h3>
          </div>
          <Button 
            variant="danger" 
            className="d-flex align-items-center gap-2 fw-bold px-4"
            style={{ borderRadius: '12px' }}
            onClick={() => handleOpenModal()}
          >
            <FiUserPlus /> Add Reseller
          </Button>
        </div>

        <div className="recent-section">
          {isLoading ? (
            <div className="text-center my-5"><Spinner animation="border" variant="danger" /></div>
          ) : error ? (
            <Alert variant="danger" className="m-3">Error loading resellers: {error.message}</Alert>
          ) : (
            <div className="custom-table-wrapper" style={{ overflowX: 'auto' }}>
              <div className="table-header-row" style={{ minWidth: '1000px', gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr 1.2fr 1fr', gap: '20px' }}>
                <div className="th-cell">
                  USERNAME
                  <ColumnFilter column="username" onFilterChange={(_, val) => setUsernameFilter(val)} placeholder="Username" />
                </div>
                <div className="th-cell">
                  FULL NAME
                  <ColumnFilter column="name" onFilterChange={(_, val) => setNameFilter(val)} placeholder="Name" />
                </div>
                <div className="th-cell">
                  EMAIL
                  <ColumnFilter column="email" onFilterChange={(_, val) => setEmailFilter(val)} placeholder="Email" />
                </div>
                <div className="th-cell text-center">USERS</div>
                <div className="th-cell">CREATED</div>
                <div className="th-cell text-center">ACTION</div>
              </div>

              {filteredResellers.map((reseller, index) => (
                <motion.div 
                  key={reseller.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="table-data-row align-items-center"
                  style={{ minWidth: '1000px', gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr 1.2fr 1fr', gap: '20px' }}
                >
                  <div className="td-cell fw-bold text-white px-2">
                    <FiUser className="text-danger me-2" />
                    {reseller.username}
                    <div className="small text-white-50 ms-4">{reseller.role}</div>
                  </div>
                  <div className="td-cell text-white">{reseller.fullName}</div>
                  <div className="td-cell text-white-50 small">{reseller.email || 'N/A'}</div>
                  <div className="td-cell text-center">
                    <Badge bg="dark" className="border border-secondary text-info px-3">
                      {reseller.totalUsers || 0}
                    </Badge>
                  </div>
                  <div className="td-cell text-white-50 small">
                    <FiCalendar className="me-1" />
                    {reseller.createdAt ? new Date(reseller.createdAt).toLocaleDateString() : 'N/A'}
                  </div>
                  <div className="td-cell text-center">
                    <div className="d-flex justify-content-center gap-2">
                      <Button variant="outline-info" size="sm" onClick={() => handleOpenModal(reseller)}>
                        <FiEdit2 />
                      </Button>
                      <Button 
                        variant={reseller.active ? "outline-danger" : "outline-success"} 
                        size="sm"
                        disabled={toggleStatusMutation.isPending}
                        onClick={() => handleStatusToggle(reseller)}
                      >
                        <FiShield />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {filteredResellers.length === 0 && (
                <div className="p-5 text-center text-white-50">No matching resellers found.</div>
              )}
            </div>
          )}
          
          <Pagination 
            currentPage={page} 
            totalPages={resellersData?.totalPages || 0} 
            onPageChange={setPage} 
          />
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered className="dark-modal">
        <Modal.Header closeButton className="bg-dark text-white border-secondary">
          <Modal.Title>{editingReseller ? 'Edit Reseller' : 'Add New Reseller'}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-white p-4">
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="text-white-50 small">Username</Form.Label>
              <Form.Control 
                type="text" 
                required 
                disabled={!!editingReseller}
                value={formData.username}
                onChange={e => setFormData({...formData, username: e.target.value})}
                placeholder="e.g. reseller_01"
                className="bg-secondary text-white border-0"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="text-white-50 small">Full Name</Form.Label>
              <Form.Control 
                type="text" 
                required 
                value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
                placeholder="e.g. John Doe"
                className="bg-secondary text-white border-0"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="text-white-50 small">Email Address</Form.Label>
              <Form.Control 
                type="email" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                placeholder="john@example.com"
                className="bg-secondary text-white border-0"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="text-white-50 small">{editingReseller ? 'New Password (leave blank to keep current)' : 'Password'}</Form.Label>
              <Form.Control 
                type="password" 
                required={!editingReseller}
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                placeholder="********"
                className="bg-secondary text-white border-0"
              />
            </Form.Group>

            <Button 
              variant="danger" 
              type="submit" 
              className="w-100 py-2 fw-bold fs-5"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? <Spinner animation="border" size="sm" /> : editingReseller ? 'Update Reseller' : 'Create Account'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      <ConfirmModal 
        show={confirmState.show}
        onHide={() => setConfirmState({ show: false, reseller: null })}
        onConfirm={executeStatusToggle}
        title={confirmState.reseller?.active ? 'Deactivate Reseller?' : 'Activate Reseller?'}
        message={`Are you sure you want to ${confirmState.reseller?.active ? 'deactivate' : 'activate'} this reseller account? This will toggle their access to the control panel.`}
        confirmText={confirmState.reseller?.active ? 'Deactivate' : 'Activate'}
        variant={confirmState.reseller?.active ? 'danger' : 'info'}
        isLoading={toggleStatusMutation.isPending}
      />
    </div>
  );
};

export default Resellers;
