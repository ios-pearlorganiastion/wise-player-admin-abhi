import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FiUser, FiArrowRight, FiShield } from 'react-icons/fi';
import { useCompleteSetup } from '../../hooks/useAuth';
import { apiClient } from '../../api/axios';
import { AUTH_ENDPOINTS } from '../../api/endpoints';
import AuthShell from '../common/AuthShell';
import Input from '../common/Input';
import PasswordInput from '../common/PasswordInput';
import Button from '../common/Button';
import ErrorAlert from '../common/ErrorAlert';
import Spinner from '../common/Spinner';

const AdminSetup = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isTokenInvalid, setIsTokenInvalid] = useState(false);

  const completeSetupMutation = useCompleteSetup();
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
      } catch (err) {
        setError(err.response?.data?.message || "This invitation link is invalid or has expired.");
        setIsTokenInvalid(true);
        setIsValidating(false);
      }
    };
    verifyToken();
  }, [token]);

  const handleSubmit = (e) => {
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
        onError: (err) => {
          setError(err.response?.data?.message || err.message || "Failed to complete setup.");
        }
      }
    );
  };

  if (isValidating) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center">
        <Spinner size={40} />
      </div>
    );
  }

  if (isTokenInvalid) {
    return (
      <AuthShell maxWidth={400}>
        <h2 className="font-display font-semibold text-ink text-lg text-center mb-3">Invalid link</h2>
        <p className="text-subtle text-sm text-center mb-6">{error}</p>
        <Button variant="primary" className="w-full justify-center" onClick={() => navigate('/')}>
          Back to login
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div className="flex justify-center mb-3">
        <FiShield className="text-maroon-light text-3xl" />
      </div>
      <h2 className="font-display font-semibold text-ink text-lg text-center mb-2">Complete your setup</h2>
      <p className="text-subtle text-sm text-center mb-5">
        Set your password and account details to activate your admin account.
      </p>

      {error ? <div className="mb-4"><ErrorAlert>{error}</ErrorAlert></div> : null}
      {success ? <div className="mb-4"><ErrorAlert variant="success">{success}</ErrorAlert></div> : null}

      {!success ? (
        <form onSubmit={handleSubmit}>
          <Input
            label="Full name"
            icon={<FiUser />}
            type="text"
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <PasswordInput
            label="New password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <PasswordInput
            label="Confirm password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <Button type="submit" variant="primary" className="w-full justify-center gap-2" disabled={completeSetupMutation.isPending}>
            {completeSetupMutation.isPending ? "Activating..." : "Activate account"} <FiArrowRight />
          </Button>
        </form>
      ) : null}
    </AuthShell>
  );
};

export default AdminSetup;