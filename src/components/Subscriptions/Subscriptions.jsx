import React, { useState } from 'react';
import { Row, Col, Badge, Image, Spinner, Alert, Button, Form, Modal } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FiUsers, FiTrendingUp, FiDollarSign, FiPlay, FiActivity, FiTrash2, FiPlus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useSubscriptions, useCreateManualSubscription, useDeleteSubscription } from '../../hooks/useSubscriptions';
import '../Dashboard/Dashboard.css';

const Subscriptions = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const size = 10;
  
  const { data: subsData, isLoading, error } = useSubscriptions(page, size);
  const createSubMutation = useCreateManualSubscription();
  const deleteSubMutation = useDeleteSubscription();

  const [showModal, setShowModal] = useState(false);
  const [newSub, setNewSub] = useState({ deviceId: '', plan: 'MONTHLY' });

  const handleCreate = (e) => {
    e.preventDefault();
    createSubMutation.mutate(newSub, {
      onSuccess: () => {
        setShowModal(false);
        setNewSub({ deviceId: '', plan: 'MONTHLY' });
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
      {/* Sidebar - Reused layout structure */}
      <div className="glass-sidebar">
        <div className="logo-box">WP</div>
        <nav className="nav-links">
          <div className="nav-item" onClick={() => navigate('/dashboard')} style={{cursor: 'pointer'}}><FiPlay /></div>
          <div className="nav-item" onClick={() => navigate('/devices')} style={{cursor: 'pointer'}}><FiUsers /></div>
          <div className="nav-item" onClick={() => navigate('/payments')} style={{cursor: 'pointer'}}><FiDollarSign /></div>
          <div className="nav-item active"><FiTrendingUp /></div>
        </nav>
      </div>

      <div className="content-area">
        <header className="dash-header">
          <div className="welcome-text">
            <h1>Active <span className="highlight">Subscriptions</span></h1>
            <p>Manage user plans and manual overrides</p>
          </div>
          <div className="profile-section">
            <Button variant="info" className="me-3 fw-bold text-white shadow-sm" style={{borderRadius: '8px'}} onClick={() => setShowModal(true)}>
              <FiPlus className="me-2"/> Manual Sub
            </Button>
            <div className="notif-bell"><FiActivity /></div>
            <Image src="https://ui-avatars.com/api/?name=Admin&background=E50914&color=fff" roundedCircle className="admin-avatar" />
          </div>
        </header>

        <div className="recent-section mt-4">
          <h3 className="section-title">Subscription List</h3>
          <div className="custom-table-wrapper">
            <div className="table-header-row">
              <div className="th-cell">DEVICE ID</div>
              <div className="th-cell">PLAN</div>
              <div className="th-cell">START DATE</div>
              <div className="th-cell">END DATE</div>
              <div className="th-cell text-center">STATUS</div>
              <div className="th-cell text-center">ACTION</div>
            </div>

            {isLoading ? (
              <div className="text-center my-5"><Spinner animation="border" variant="info" /></div>
            ) : error ? (
              <Alert variant="danger" className="m-3">Error loading subscriptions: {error.message}</Alert>
            ) : subsData?.content?.length === 0 ? (
              <div className="p-4 text-center text-muted">No subscriptions found.</div>
            ) : (
              subsData?.content?.map((sub, index) => (
                <motion.div 
                  key={sub.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="table-data-row align-items-center"
                >
                  <div className="td-cell fw-bold text-truncate" style={{maxWidth: '150px'}} title={sub.deviceId}>
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
                  <div className="td-cell text-center">
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      disabled={deleteSubMutation.isPending}
                      onClick={() => handleDelete(sub.id)}
                    >
                      <FiTrash2 />
                    </Button>
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

      {/* Manual Subscription Modal */}
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
                <option value="MONTHLY">Monthly</option>
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
