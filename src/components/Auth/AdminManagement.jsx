import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiArrowLeft, FiSend } from 'react-icons/fi';
import { useInviteAdmin } from '../../hooks/useAuth';
import AuthShell from '../common/AuthShell';
import Input from '../common/Input';
import Button from '../common/Button';
import ErrorAlert from '../common/ErrorAlert';

const AdminManagement = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const inviteMutation = useInviteAdmin();

  const handleInvite = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    inviteMutation.mutate(
      { email },
      {
        onSuccess: () => {
          setSuccess("Invitation sent! Redirecting...");
          setEmail('');
          setTimeout(() => navigate('/dashboard'), 2000);
        },
        onError: (err) => {
          setError(err.message || "Failed to send invitation.");
        }
      }
    );
  };

  return (
    <AuthShell maxWidth={480}>
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-maroon-light hover:text-maroon text-sm mb-4 transition-colors"
      >
        <FiArrowLeft /> Back to dashboard
      </button>

      <h2 className="font-display font-semibold text-ink text-lg mb-2">Invite new admin</h2>
      <p className="text-subtle text-sm mb-5">Enter the email of the person you want to invite as an administrator.</p>

      {error ? <div className="mb-4"><ErrorAlert>{error}</ErrorAlert></div> : null}
      {success ? <div className="mb-4"><ErrorAlert variant="success">{success}</ErrorAlert></div> : null}

      <form onSubmit={handleInvite}>
        <Input
          label="Email address"
          icon={<FiMail />}
          type="email"
          placeholder="admin@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button
          type="submit"
          variant="primary"
          className="w-full justify-center gap-2"
          disabled={inviteMutation.isPending || !!success}
        >
          {inviteMutation.isPending ? "Sending..." : success ? "Sent" : "Send invitation"} <FiSend />
        </Button>
      </form>
    </AuthShell>
  );
};

export default AdminManagement;