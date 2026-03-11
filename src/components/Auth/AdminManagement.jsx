import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FiMail, FiArrowLeft, FiSend } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useInviteAdmin } from '../../hooks/useAuth';
import './Auth.css';

const AdminManagement = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const inviteMutation = useInviteAdmin();

  const handleInvite = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    inviteMutation.mutate(
      { email },
      {
        onSuccess: () => {
          setSuccess("Invitation sent!");
          setEmail('');
          // Removed the timeout to keep the green state until manual reset or navigation
        },
        onError: (err) => {
          setError(err.message || "Failed to send invitation.");
        }
      }
    );
  };

  return (
    <div className="auth-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-100"
        style={{ maxWidth: '500px' }}
      >
        <Card className="auth-card p-4">
          <div className="card-content">
            <div className="mb-4">
              <Button variant="link" onClick={() => navigate('/dashboard')} className="text-info p-0 mb-3 d-flex align-items-center">
                <FiArrowLeft className="me-2" /> Back to Dashboard
              </Button>
              <h2 className="login-title text-start">Invite New Admin</h2>
              <p className="text-muted">Enter the email of the person you want to invite as an administrator.</p>
            </div>

            {error && <Alert variant="danger" className="custom-alert">{error}</Alert>}
            {success && <Alert variant="success" className="custom-alert text-break">{success}</Alert>}

            <Form onSubmit={handleInvite}>
              <Form.Group className="mb-4 custom-input-group">
                <Form.Label className="text-light small mb-2">Email Address</Form.Label>
                <div className="input-group">
                  <span className="input-group-text"><FiMail /></span>
                  <Form.Control
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </Form.Group>


              <Button 
                type="submit" 
                className={`w-100 login-btn ${success ? 'success-btn' : ''}`} 
                disabled={inviteMutation.isPending || !!success}
              >
                {inviteMutation.isPending ? "SENDING..." : success ? "SENT" : "SEND INVITATION"} 
                <FiSend className="ms-2" />
              </Button>
            </Form>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminManagement;
