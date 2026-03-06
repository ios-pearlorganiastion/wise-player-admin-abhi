import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Form, Button, Card, InputGroup, Alert } from 'react-bootstrap';
import { FiMail, FiLock, FiGithub, FiTwitter, FiArrowRight } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useNavigate, Link } from 'react-router-dom';
import { useLogin } from '../../hooks/useAuth';
import './Auth.css';

const Login = ({ toggleForm }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const loginMutation = useLogin();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    loginMutation.mutate(
      { username: email, password },
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
      {/* Background Shapes for extra "Khatarnak" look */}
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
              <p className="subtitle">Experience the sound of wisdom</p>
            </div>

            <h3 className="login-title">Welcome Back</h3>

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
                <InputGroup>
                  <InputGroup.Text><FiMail /></InputGroup.Text>
                  <Form.Control 
                    type="email" 
                    placeholder="Email address" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-3 custom-input-group">
                <InputGroup>
                  <InputGroup.Text><FiLock /></InputGroup.Text>
                  <Form.Control 
                    type="password" 
                    placeholder="Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                </InputGroup>
              </Form.Group>

              <div className="text-end mb-4">
                <span className="forgot-pass">Forgot Password?</span>
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button type="submit" className="w-100 login-btn" disabled={loginMutation.isPending}>
                  {loginMutation.isPending ? "SIGNING IN..." : "SIGN IN"} <FiArrowRight className="ms-2" />
                </Button>
              </motion.div>

              <div className="divider">
                <span>OR CONTINUE WITH</span>
              </div>

              <div className="social-grid">
                <button type="button" className="social-item"><FcGoogle /></button>
                <button type="button" className="social-item"><FiGithub /></button>
                <button type="button" className="social-item twitter"><FiTwitter /></button>
              </div>
            </Form>

            <p className="auth-footer">
              Secure Admin Portal
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;