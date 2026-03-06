import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Form, Button, Card, InputGroup, Alert } from 'react-bootstrap';
import { FiUser, FiMail, FiLock, FiGithub, FiTwitter, FiArrowRight } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useNavigate, Link } from 'react-router-dom';
import { useSetup } from '../../hooks/useAuth';
import './Auth.css';

const Register = ({ toggleForm }) => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const setupMutation = useSetup();

  const handleRegister = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    setupMutation.mutate(
      { username: email, password, fullName, role: "ADMIN" },
      {
        onSuccess: () => {
          setSuccessMsg("Account created! You can now log in.");
          setFullName('');
          setEmail('');
          setPassword('');
          setTimeout(() => navigate('/'), 2000); // Redirect to login after a delay
        },
        onError: (err) => {
          setError(err.response?.data?.message || err.message || "Failed to create account.");
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

            <h3 className="login-title">Create Account</h3>

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
              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Alert variant="success" className="custom-alert">{successMsg}</Alert>
                </motion.div>
              )}
            </AnimatePresence>
            
            <Form onSubmit={handleRegister} className="mt-4">
              <Form.Group className="mb-4 custom-input-group">
                <InputGroup>
                  <InputGroup.Text><FiUser /></InputGroup.Text>
                  <Form.Control 
                    type="text" 
                    placeholder="Full Name" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required 
                  />
                </InputGroup>
              </Form.Group>

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

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mt-4">
                <Button type="submit" className="w-100 login-btn" disabled={setupMutation.isPending}>
                  {setupMutation.isPending ? "CREATING..." : "SIGN UP"} <FiArrowRight className="ms-2" />
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
              Already have an account? <Link to="/" className="toggle-btn">Login</Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Register;