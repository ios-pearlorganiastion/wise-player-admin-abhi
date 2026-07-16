import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiArrowRight } from 'react-icons/fi';
import { useLogin } from '../../hooks/useAuth';
import AuthShell from '../common/AuthShell';
import Input from '../common/Input';
import PasswordInput from '../common/PasswordInput';
import Button from '../common/Button';
import ErrorAlert from '../common/ErrorAlert';

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
        onSuccess: () => navigate('/dashboard'),
        onError: (err) => {
          setError(err.response?.data?.message || err.message || "Invalid credentials.");
        }
      }
    );
  };

  return (
    <AuthShell>
      <h2 className="font-display font-semibold text-ink text-lg text-center mb-5">Login</h2>

      {error ? <div className="mb-4"><ErrorAlert>{error}</ErrorAlert></div> : null}

      <form onSubmit={handleLogin}>
        <Input
          label="Username"
          icon={<FiUser />}
          type="text"
          placeholder="Enter admin username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <PasswordInput
          label="Password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="flex justify-end mb-5">
          <button
            type="button"
            onClick={() => navigate('/forgot-password')}
            className="text-subtle hover:text-maroon-light text-xs transition-colors"
          >
            Forgot password?
          </button>
        </div>

        <Button type="submit" variant="primary" className="w-full justify-center gap-2" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? "Signing in..." : "Sign in"} <FiArrowRight />
        </Button>
      </form>

      <p className="text-center text-subtle text-xs mt-6">Secure Admin Portal v2.0</p>
    </AuthShell>
  );
};

export default Login;