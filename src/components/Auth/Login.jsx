import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Form, Button, Card, InputGroup, Alert } from 'react-bootstrap';
import { FiUser, FiLock, FiArrowRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '../../hooks/useAuth';
import './Auth.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const loginMutation = useLogin();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    loginMutation.mutate(
      { username, password },
      {
        onSuccess: () => {
          navigate('/dashboard');
        },
        onError: (err) => {
          setError(err.response?.data?.message || err.message || "Invalid credentials.");
        }
      }
    );
  };

  return (
    <div className="auth-container">
      {/* Background Shapes */}
      <div className="shape shape-1"></div>
      <div className="shape shape-2"></div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.6, ease: "backOut" }}
      >
        <Card className="auth-card">
          <div className="glass-overlay"></div>
          
          <div className="card-content">
            <div className="text-center mb-4">
              <motion.h1 
                className="brand-logo"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                WISE PLAYER
              </motion.h1>
              <p className="subtitle">Secure Admin Access</p>
            </div>

            <h3 className="login-title">Admin Login</h3>

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
            </AnimatePresence>
            
            <Form onSubmit={handleLogin} className="mt-4">
              <Form.Group className="mb-4 custom-input-group">
                <Form.Label className="text-light small mb-2">Username</Form.Label>
                <InputGroup>
                  <InputGroup.Text><FiUser /></InputGroup.Text>
                  <Form.Control 
                    type="text" 
                    placeholder="Enter admin username" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required 
                  />
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-3 custom-input-group">
                <Form.Label className="text-light small mb-2">Password</Form.Label>
                <InputGroup>
                  <InputGroup.Text><FiLock /></InputGroup.Text>
                  <Form.Control 
                    type="password" 
                    placeholder="Enter password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </InputGroup>
              </Form.Group>

              <div className="d-flex justify-content-end mb-4">
                <Button 
                  variant="link" 
                  className="p-0 text-decoration-none text-light-50 small"
                  onClick={() => navigate('/forgot-password')}
                >
                  Forgot Password?
                </Button>
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button type="submit" className="w-100 login-btn" disabled={loginMutation.isPending}>
                  {loginMutation.isPending ? "SIGNING IN..." : "SIGN IN"} <FiArrowRight className="ms-2" />
                </Button>
              </motion.div>
            </Form>

            <p className="auth-footer mt-4">
              Secure Admin Portal v1.0
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;