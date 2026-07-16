import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import { apiClient } from '../../api/axios';
import { AUTH_ENDPOINTS } from '../../api/endpoints';
import AuthShell from '../common/AuthShell';
import Input from '../common/Input';
import Button from '../common/Button';
import ErrorAlert from '../common/ErrorAlert';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await apiClient.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email });
      setMessage(response.data.message);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <h2 className="font-display font-semibold text-ink text-lg text-center mb-2">Forgot password</h2>
      <p className="text-subtle text-sm text-center mb-5">
        Enter your registered email address and we'll send you a link to reset your password.
      </p>

      {error ? <div className="mb-4"><ErrorAlert>{error}</ErrorAlert></div> : null}
      {message ? <div className="mb-4"><ErrorAlert variant="success">{message}</ErrorAlert></div> : null}

      <form onSubmit={handleSubmit}>
        <Input
          label="Email address"
          icon={<FiMail />}
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button type="submit" variant="primary" className="w-full justify-center gap-2" disabled={loading}>
          {loading ? "Sending link..." : "Send reset link"} <FiArrowRight />
        </Button>
      </form>

      <div className="text-center mt-5">
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 justify-center w-full text-subtle hover:text-ink text-sm transition-colors"
        >
          <FiArrowLeft /> Back to login
        </button>
      </div>
    </AuthShell>
  );
};

export default ForgotPassword;