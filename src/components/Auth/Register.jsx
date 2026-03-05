import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Form, Button, Card, InputGroup, Alert } from 'react-bootstrap';
import { FiUser, FiMail, FiLock } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useSetup } from '../../hooks/useAuth';
import './Auth.css';

const Register = ({ toggleForm }) => {
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
          // Optional: setTimeout(() => toggleForm(), 2000);
        },
        onError: (err) => {
          setError(err.response?.data?.message || err.message || "Failed to create account.");
        }
      }
    );
  };
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="auth-card p-4" style={{ width: '350px' }}>
        <h2 className="text-center mb-4">Register</h2>
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <Alert variant="danger" className="py-2">{error}</Alert>
            </motion.div>
          )}
          {successMsg && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <Alert variant="success" className="py-2">{successMsg}</Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <Form onSubmit={handleRegister}>
          <Form.Group className="mb-3">
            <InputGroup>
              <InputGroup.Text className="bg-transparent text-white border-0"><FiUser /></InputGroup.Text>
              <Form.Control type="text" placeholder="Full Name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-3">
            <InputGroup>
              <InputGroup.Text className="bg-transparent text-white border-0"><FiMail /></InputGroup.Text>
              <Form.Control type="email" placeholder="Email address" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-4">
            <InputGroup>
              <InputGroup.Text className="bg-transparent text-white border-0"><FiLock /></InputGroup.Text>
              <Form.Control type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </InputGroup>
          </Form.Group>

          <Button type="submit" variant="info" className="w-100 fw-bold mb-3 shadow text-white" style={{borderRadius: '10px'}} disabled={setupMutation.isPending}>
            {setupMutation.isPending ? "CREATING..." : "SIGN UP"}
          </Button>
        </Form>
        <p className="text-center small">
          Already have an account? <Link to="/" className="toggle-btn">Login</Link>
        </p>
      </Card>
    </motion.div>
  );
};

export default Register;