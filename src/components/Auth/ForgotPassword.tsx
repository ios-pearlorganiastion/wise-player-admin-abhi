import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Form, Button, Card, InputGroup, Alert } from 'react-bootstrap';
import { FiMail, FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/axios';
import { AUTH_ENDPOINTS } from '../../api/endpoints';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await apiClient.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email });
      setMessage(response.data.message);
      // Redirect to login after 3 seconds
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
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

            <h3 className="login-title">Forgot Password</h3>
            <p className="text-white small text-center mb-4">
              Enter your registered email address and we'll send you a link to reset your password.
            </p>

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
              {message && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Alert variant="success" className="custom-alert">{message}</Alert>
                </motion.div>
              )}
            </AnimatePresence>
            
            <Form onSubmit={handleSubmit} className="mt-4">
              <Form.Group className="mb-4 custom-input-group">
                <Form.Label className="text-light small mb-2">Email Address</Form.Label>
                <InputGroup>
                  <InputGroup.Text><FiMail /></InputGroup.Text>
                  <Form.Control 
                    type="email" 
                    placeholder="Enter your email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </InputGroup>
              </Form.Group>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button type="submit" className="w-100 login-btn" disabled={loading}>
                  {loading ? "SENDING LINK..." : "SEND RESET LINK"} <FiArrowRight className="ms-2" />
                </Button>
              </motion.div>
            </Form>

            <div className="text-center mt-4">
              <Button 
                variant="link" 
                className="text-decoration-none text-light-50 small"
                onClick={() => navigate('/login')}
              >
                <FiArrowLeft className="me-2" /> Back to Login
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
