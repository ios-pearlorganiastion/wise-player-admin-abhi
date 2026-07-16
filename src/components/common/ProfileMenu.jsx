import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLock, FiUser, FiCheck } from 'react-icons/fi';
import { apiClient } from '../../api/axios';
import { AUTH_ENDPOINTS } from '../../api/endpoints';
import PasswordInput from './PasswordInput';
import Button from './Button';
import ErrorAlert from './ErrorAlert';

const formatRole = (role) => {
  if (role === 'SUPER_ADMIN') return 'Super admin';
  if (role === 'ADMIN') return 'Admin';
  return role || 'Admin';
};

const ProfileMenu = ({ user }) => {
  const [open, setOpen] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const initials = (user?.fullName || 'Admin')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const resetForm = () => {
    setShowPasswordForm(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
  };

  const closeMenu = () => {
    setOpen(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post(AUTH_ENDPOINTS.CHANGE_PASSWORD, { currentPassword, newPassword, confirmPassword });
      setSuccess('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password. Please check your current password.');
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`relative w-10 h-10 rounded-full bg-maroon/20 border border-maroon/30 flex items-center justify-center transition-shadow ${open ? 'ring-2 ring-maroon-light' : ''}`}
        aria-label="Open profile menu"
      >
        <span className="font-display font-semibold text-sm text-maroon-light">{initials}</span>
        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-surface" />
      </button>

      <AnimatePresence>
        {open ? (
          <>
            <div className="fixed inset-0 z-40" onClick={closeMenu} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-3 w-72 max-w-[calc(100vw-2rem)] bg-surface border border-line rounded-xl overflow-hidden shadow-lg z-50"
            >
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-line">
                <div className="w-11 h-11 rounded-full bg-maroon/20 border border-maroon/30 flex items-center justify-center shrink-0">
                  <span className="font-display font-semibold text-sm text-maroon-light">{initials}</span>
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-ink text-sm truncate">{user?.fullName || 'Admin'}</p>
                  <p className="flex items-center gap-1 text-subtle text-xs truncate mt-0.5">
                         <FiUser className="text-[10px] shrink-0" /> {user?.username || 'unknown'}
                  </p>
                  <span className="inline-block mt-1 text-[10px] font-medium text-maroon-light bg-maroon/15 rounded-full px-2 py-0.5">
                    {formatRole(user?.role)}
                  </span>
                </div>
              </div>

              <div className="p-1.5">
                {!showPasswordForm ? (
                  <button
                    onClick={() => setShowPasswordForm(true)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-ink hover:bg-surface2 transition-colors"
                  >
                    <FiLock className="text-subtle text-sm" /> Change password
                  </button>
                ) : (
                  <div className="p-2.5">
                    {error ? <div className="mb-3"><ErrorAlert>{error}</ErrorAlert></div> : null}
                    {success ? <div className="mb-3"><ErrorAlert variant="success">{success}</ErrorAlert></div> : null}

                    {!success ? (
                      <form onSubmit={handleSubmit}>
                        <PasswordInput
                          label="Current password"
                          placeholder="Current password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          required
                          disabled={loading}
                        />
                        <PasswordInput
                          label="New password"
                          placeholder="At least 8 characters"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          minLength={8}
                          disabled={loading}
                        />
                        <PasswordInput
                          label="Confirm new password"
                          placeholder="Re-type new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          disabled={loading}
                        />
                        <div className="flex gap-2 mt-1">
                          <button
                            type="button"
                            onClick={resetForm}
                            className="flex-1 text-xs font-medium text-subtle hover:text-ink border border-line rounded-lg py-2 transition-colors"
                          >
                            Cancel
                          </button>
                          <Button type="submit" variant="primary" className="flex-1 justify-center text-xs !py-2" disabled={loading}>
                            {loading ? 'Updating...' : 'Update'}
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <button
                        onClick={resetForm}
                        className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-emerald-400 border border-emerald-500/30 rounded-lg py-2"
                      >
                        <FiCheck /> Done
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default ProfileMenu;