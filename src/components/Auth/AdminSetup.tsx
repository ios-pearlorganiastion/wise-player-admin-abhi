import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { FiLock, FiUser, FiArrowRight, FiShield } from 'react-icons/fi';
import { useCompleteSetup } from '../../hooks/useAuth';
import { apiClient } from '../../api/axios';
import { AUTH_ENDPOINTS } from '../../api/endpoints';
import './Auth.css';

const AdminSetup: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Track if the initial token validation failed fundamentally
  const [isTokenInvalid, setIsTokenInvalid] = useState(false);

  // useCompleteSetup is a custom hook and typically returns a mutation object.
  const completeSetupMutation: any = useCompleteSetup();
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError("Invalid or missing invitation token.");
        setIsTokenInvalid(true);
        setIsValidating(false);
        return;
      }

      try {
        setIsValidating(true);
        await apiClient.get(`${AUTH_ENDPOINTS.VERIFY_INVITE}?token=${token}`);
        setIsValidating(false);
      } catch (err: any) {
        setError(err.response?.data?.message || "This invitation link is invalid or has expired.");
        setIsTokenInvalid(true);
        setIsValidating(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    completeSetupMutation.mutate(
      { token, password, fullName },
      {
        onSuccess: () => {
          setSuccess("Account activated successfully! Redirecting to login...");
          setTimeout(() => navigate('/'), 3000);
        },
        onError: (err: any) => {
           setError(err.response?.data?.message || err.message || "Failed to complete setup.");
        }
      }
    );
  };

  if (isValidating) {
    return (
      <div className="auth-container d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
        <motion.div
           animate={{ rotate: 360 }}
           transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
           style={{ width: 50, height: 50, border: '5px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary-glow)', borderRadius: '50%' }}
        />
      </div>
    );
  }

  if (isTokenInvalid) {
    return (
      <div className="auth-container d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
        <Alert variant="danger" className="text-center custom-alert" style={{ maxWidth: '400px', padding: '2rem' }}>
          <h4 className="text-light mb-3">Invalid Link</h4>
          <p className="mb-4">{error}</p>
          <Button className="login-btn w-100" onClick={() => navigate('/')}>Back to Login</Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="auth-container d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-100"
        style={{ maxWidth: '450px' }}
      >
        <Card className="auth-card p-4">
          <div className="card-content">
            <div className="text-center mb-4">
              <div className="mb-3">
                <FiShield style={{ fontSize: '3rem', color: 'var(--n-blue)' }} />
              </div>
              <h2 className="login-title">Complete Your Setup</h2>
              <p className="text-muted">Set your password and account details to activate your admin account.</p>
            </div>

            {error && <Alert variant="danger" className="custom-alert">{error}</Alert>}
            {success && <Alert variant="success" className="custom-alert">{success}</Alert>}

            {!success && (
              <Form onSubmit={handleSubmit}>
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
                    <InputGroup.Text><FiLock /></InputGroup.Text>
                    <Form.Control
                      type="password"
                      placeholder="New Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-4 custom-input-group">
                  <InputGroup>
                    <InputGroup.Text><FiLock /></InputGroup.Text>
                    <Form.Control
                      type="password"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </InputGroup>
                </Form.Group>

                <Button type="submit" className="w-100 login-btn" disabled={completeSetupMutation.isPending}>
                  {completeSetupMutation.isPending ? "ACTIVATING..." : "ACTIVATE ACCOUNT"} <FiArrowRight className="ms-2" />
                </Button>
              </Form>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminSetup;
