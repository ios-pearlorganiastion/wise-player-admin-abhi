import React, { useState, useMemo } from 'react';
import { Row, Col, Badge, Image, Spinner, Alert, Button, Modal, Form } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckSquare, FiCheck, FiX, FiActivity, FiLogOut, FiMessageSquare, FiMenu } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useActivationRequests, useApproveActivation, useRejectActivation } from '../../hooks/useActivationRequests';
import { useAuthContext } from '../../contexts/AuthContext';
import ColumnFilter from '../Shared/ColumnFilter';
import Pagination from '../Shared/Pagination';
import Sidebar from '../Shared/Sidebar';
import '../Dashboard/Dashboard.css';

const ActivationRequests = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuthContext();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [page, setPage] = useState(0);
  const size = 20;
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [deviceFilter, setDeviceFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');

  const { data: requestsData, isLoading, error } = useActivationRequests(statusFilter, page, size);

  const filteredRequests = useMemo(() => {
    if (!requestsData?.content) return [];
    return requestsData.content.filter(req => {
      const matchDevice = !deviceFilter || req.deviceId?.toLowerCase().includes(deviceFilter.toLowerCase());
      const matchPlan = !planFilter || req.planName?.toLowerCase().includes(planFilter.toLowerCase());
      return matchDevice && matchPlan;
    });
  }, [requestsData, deviceFilter, planFilter]);
  const approveMutation = useApproveActivation();
  const rejectMutation = useRejectActivation();

  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionType, setActionType] = useState('APPROVE'); // 'APPROVE' or 'REJECT'
  const [actionError, setActionError] = useState('');

  const handleOpenModal = (request, type) => {
    setSelectedRequest(request);
    setActionType(type);
    setAdminNotes('');
    setActionError('');
    setShowModal(true);
  };

  const handleAction = (e) => {
    e.preventDefault();
    setActionError('');
    const mutation = actionType === 'APPROVE' ? approveMutation : rejectMutation;
    mutation.mutate({ id: selectedRequest.id, adminNotes }, {
      onSuccess: () => setShowModal(false),
      onError: (err) => {
        setActionError(err.response?.data?.message || err.message || 'An error occurred during the action.');
      }
    });
  };

  return (
    <div className="dashboard-container">
      <Sidebar 
        activePage="activation-requests" 
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
              <h1>Activation <span className="highlight">Requests</span></h1>
              <p>Approve or reject manual activation and renewal requests</p>
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

        <div className="action-row mt-4 mb-4 d-flex gap-2">
          {['PENDING', 'APPROVED', 'REJECTED'].map(status => (
            <Button 
              key={status}
              variant={statusFilter === status ? 'info' : 'outline-info'} 
              className={`fw-bold ${statusFilter === status ? 'text-white' : ''}`}
              style={{ borderRadius: '12px' }}
              onClick={() => { setStatusFilter(status); setPage(0); }}
            >
              {status}
            </Button>
          ))}
        </div>

        <div className="recent-section">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="section-title m-0">{statusFilter} Requests</h3>
          </div>

          <div className="custom-table-wrapper" style={{ overflowX: 'auto' }}>
            <div className="table-header-row req-table-grid">
              <div className="th-cell align-left">ID</div>
              <div className="th-cell align-left">
                DEVICE ID
                <ColumnFilter column="device" onFilterChange={(_, val) => setDeviceFilter(val)} placeholder="Device ID" />
              </div>
              <div className="th-cell align-left">
                PLAN
                <ColumnFilter column="plan" onFilterChange={(_, val) => setPlanFilter(val)} placeholder="Plan" />
              </div>
              <div className="th-cell align-right">AMOUNT</div>
              <div className="th-cell align-center">STATUS</div>

              <div className="th-cell align-left">DATE</div>
              <div className="th-cell align-center">ACTIONS</div>
            </div>

            {isLoading ? (
              <div className="text-center my-5"><Spinner animation="border" variant="info" /></div>
            ) : error ? (
              <Alert variant="danger" className="m-3">Error loading requests: {error.message}</Alert>
            ) : requestsData?.content?.length === 0 ? (
              <div className="p-4 text-center text-white">No {statusFilter.toLowerCase()} requests found.</div>
            ) : filteredRequests.length === 0 ? (
              <div className="p-4 text-center text-white">No requests match your filters.</div>
            ) : (
              filteredRequests.map((req, index) => (
                <motion.div 
                  key={req.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="table-data-row align-items-center req-table-grid"
                >
                  <div className="td-cell align-left text-white-50">#{req.id}</div>
                  <div className="td-cell align-left fw-bold text-white px-2 wrap-text" title={req.deviceId}>{req.deviceId}</div>
                  <div className="td-cell align-left">{req.planName}</div>
                  <div className="td-cell align-right fw-bold text-success">{req.amount} {req.currency}</div>
                  <div className="td-cell align-center">
                    <Badge className={`status-pill ${req.status.toLowerCase()}`}>
                      {req.status}
                    </Badge>
                  </div>

                  <div className="td-cell align-left text-white">{new Date(req.createdAt).toLocaleDateString()}</div>
                  <div className="td-cell align-center">
                    {req.status === 'PENDING' ? (
                      <>
                        <Button variant="outline-success" size="sm" className="me-2" onClick={() => handleOpenModal(req, 'APPROVE')} title="Approve">
                          <FiCheck />
                        </Button>
                        <Button variant="outline-danger" size="sm" onClick={() => handleOpenModal(req, 'REJECT')} title="Reject">
                          <FiX />
                        </Button>
                      </>
                    ) : (
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="text-info p-0 text-decoration-none"
                        onClick={() => handleOpenModal(req, 'VIEW')}
                      >
                        {req.adminNotes ? <><FiMessageSquare className="me-1" /> View Notes</> : <span className="text-white-50">No notes</span>}
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
          
          <Pagination 
            currentPage={page} 
            totalPages={requestsData?.totalPages || 0} 
            onPageChange={setPage} 
          />
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered className="dark-modal">
        <Modal.Header closeButton className="border-secondary bg-dark text-white">
          <Modal.Title>
            {actionType === 'APPROVE' ? 'Approve Request' : 
             actionType === 'REJECT' ? 'Reject Request' : 
             'Request Details'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-white">
          {actionError && <Alert variant="danger" className="mb-3 border border-danger">{actionError}</Alert>}
          <Form onSubmit={handleAction}>
            <div className="mb-3 p-3 bg-secondary rounded" style={{ fontSize: '0.9rem' }}>
              <div><strong>Device ID:</strong> {selectedRequest?.deviceId}</div>
              <div><strong>Plan:</strong> {selectedRequest?.planName}</div>
              <div><strong>Amount:</strong> {selectedRequest?.amount} {selectedRequest?.currency}</div>
              <div><strong>Status:</strong> <Badge className={`status-pill ${selectedRequest?.status.toLowerCase()}`}>{selectedRequest?.status}</Badge></div>
            </div>
            
            <Form.Group className="mb-3">
              <Form.Label>Admin Notes</Form.Label>
              <Form.Control 
                as="textarea"
                rows={3}
                required={actionType === 'REJECT'}
                readOnly={actionType === 'VIEW'}
                value={actionType === 'VIEW' ? (selectedRequest?.adminNotes || 'No notes provided.') : adminNotes} 
                onChange={e => setAdminNotes(e.target.value)}
                placeholder={actionType === 'APPROVE' ? "Optional notes about approval..." : "Reason for rejection (required)..."}
                className="bg-secondary text-white border-0"
              />
            </Form.Group>
            
            {actionType !== 'VIEW' && (
              <Button 
                variant={actionType === 'APPROVE' ? "success" : "danger"} 
                type="submit" 
                className="w-100 text-white mt-2" 
                disabled={approveMutation.isPending || rejectMutation.isPending}
              >
                {actionType === 'APPROVE' ? 'Approve' : 'Reject'}
              </Button>
            )}
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ActivationRequests;
