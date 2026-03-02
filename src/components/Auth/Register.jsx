import React from 'react';
import { motion } from 'framer-motion';
import { Form, Button, Card, InputGroup } from 'react-bootstrap';
import { FiUser, FiMail, FiLock } from 'react-icons/fi';
import './Auth.css';

const Register = ({ toggleForm }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="auth-card p-4" style={{ width: '350px' }}>
        <h2 className="text-center mb-4">Register</h2>
        <Form>
          <Form.Group className="mb-3">
            <InputGroup>
              <InputGroup.Text className="bg-transparent text-white border-0"><FiUser /></InputGroup.Text>
              <Form.Control type="text" placeholder="Full Name" />
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-3">
            <InputGroup>
              <InputGroup.Text className="bg-transparent text-white border-0"><FiMail /></InputGroup.Text>
              <Form.Control type="email" placeholder="Email address" />
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-4">
            <InputGroup>
              <InputGroup.Text className="bg-transparent text-white border-0"><FiLock /></InputGroup.Text>
              <Form.Control type="password" placeholder="Password" />
            </InputGroup>
          </Form.Group>

          <Button variant="info" className="w-100 fw-bold mb-3 shadow text-white" style={{borderRadius: '10px'}}>
            SIGN UP
          </Button>
        </Form>
        <p className="text-center small">
          Already have an account? <span onClick={toggleForm} className="toggle-btn">Login</span>
        </p>
      </Card>
    </motion.div>
  );
};

export default Register;