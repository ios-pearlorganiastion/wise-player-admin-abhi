import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { apiClient } from '../../api/axios';
import { AUTH_ENDPOINTS } from '../../api/endpoints';
import AuthShell from '../common/AuthShell';
import PasswordInput from '../common/PasswordInput';
import Button from '../common/Button';
import ErrorAlert from '../common/ErrorAlert';

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

  const handleSubmit = async (e) => {
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
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. The link may be expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <h2 className="font-display font-semibold text-ink text-lg text-center mb-5">Reset password</h2>

      {error ? <div className="mb-4"><ErrorAlert>{error}</ErrorAlert></div> : null}
      {success ? (
        <div className="mb-4"><ErrorAlert variant="success">Password reset successful! Redirecting to login...</ErrorAlert></div>
      ) : null}

      {!success ? (
        <form onSubmit={handleSubmit}>
          <PasswordInput
            label="New password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <PasswordInput
            label="Confirm new password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <Button type="submit" variant="primary" className="w-full justify-center gap-2" disabled={loading || !token}>
            {loading ? "Resetting..." : "Reset password"} <FiArrowRight />
          </Button>
        </form>
      ) : null}
    </AuthShell>
  );
};

export default ResetPassword;