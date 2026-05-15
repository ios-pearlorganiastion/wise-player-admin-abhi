import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Form, Button, Card, InputGroup, Alert } from 'react-bootstrap';
import { FiLock, FiCheck, FiArrowRight } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiClient } from '../../api/axios';
import { AUTH_ENDPOINTS } from '../../api/endpoints';
import './Auth.css';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get('token');
    if (!tokenParam) {
      setError('Invalid or missing reset token.');
    } else {
      setToken(tokenParam);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await apiClient.post(AUTH_ENDPOINTS.RESET_PASSWORD, { token, newPassword });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password. The link may be expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="shape shape-1"></div>
      <div className="shape shape-2"></div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "backOut" }}
      >
        <Card className="auth-card">
          <div className="glass-overlay"></div>
          
          <div className="card-content">
            <div className="text-center mb-4">
              <h1 className="brand-logo">WISE PLAYER</h1>
              <p className="subtitle">Secure Admin Access</p>
            </div>

            <h3 className="login-title">Reset Password</h3>
            
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Alert variant="danger" className="custom-alert">{error}</Alert>
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Alert variant="success" className="custom-alert">
                    Password reset successful! Redirecting to login...
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>
            
            {!success && (
              <Form onSubmit={handleSubmit} className="mt-4">
                <Form.Group className="mb-4 custom-input-group">
                  <Form.Label className="text-light small mb-2">New Password</Form.Label>
                  <InputGroup>
                    <InputGroup.Text><FiLock /></InputGroup.Text>
                    <Form.Control 
                      type="password" 
                      placeholder="Enter new password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required 
                    />
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-4 custom-input-group">
                  <Form.Label className="text-light small mb-2">Confirm New Password</Form.Label>
                  <InputGroup>
                    <InputGroup.Text><FiCheck /></InputGroup.Text>
                    <Form.Control 
                      type="password" 
                      placeholder="Confirm new password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required 
                    />
                  </InputGroup>
                </Form.Group>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button type="submit" className="w-100 login-btn" disabled={loading || !token}>
                    {loading ? "RESETTING..." : "RESET PASSWORD"} <FiArrowRight className="ms-2" />
                  </Button>
                </motion.div>
              </Form>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
