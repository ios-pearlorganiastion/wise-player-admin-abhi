import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, Alert, Spinner } from 'react-bootstrap';
import { FiLock, FiEye, FiEyeOff, FiMenu, FiActivity, FiLogOut } from 'react-icons/fi';
import { apiClient } from '../../api/axios';
import { AUTH_ENDPOINTS } from '../../api/endpoints';
import { useAuthContext } from '../../contexts/AuthContext';
import Sidebar from '../Shared/Sidebar';
import '../Dashboard/Dashboard.css';
import './Auth.css';

const ChangePassword = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuthContext();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
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
      await apiClient.post(AUTH_ENDPOINTS.CHANGE_PASSWORD, {
        currentPassword,
        newPassword,
      });

      // Only reached on HTTP 200 success
      setSuccess('Password changed successfully. Redirecting to login...');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Redirect after 2 seconds
      setTimeout(() => {
        logout();
        navigate('/');
      }, 2000);

    } catch (err: any) {
      // Display error message from backend, stay on this page
      setError(
        err.response?.data?.message ||
        'Failed to change password. Please check your current password.'
      );
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar
        activePage="change-password"
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      <div className="content-area">
        <header className="dash-header">
          <div className="header-left-group">
            <button
              className="mobile-toggle-btn"
              onClick={() => setIsMobileOpen(true)}
            >
              <FiMenu />
            </button>
            <div className="welcome-text">
              <h1>Security <span className="highlight">Settings</span></h1>
              <p>Update your administrator credentials for platform access</p>
            </div>
          </div>
          <div className="profile-section">
            <div className="notif-bell"><FiActivity /></div>

            <div className="profile-dropdown-container">
              <div
                className={`profile-avatar-trigger ${showProfileMenu ? 'active' : ''}`}
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <Image
                  src={`https://ui-avatars.com/api/?name=${user?.fullName || 'Admin'}&background=E50914&color=fff`}
                  roundedCircle
                  className="admin-avatar m-0"
                />
              </div>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="profile-menu"
                  >
                    <div className="px-3 py-2">
                      <div className="fw-bold text-white">{user?.fullName}</div>
                      <div className="small text-muted">{user?.role}</div>
                    </div>
                    <div className="profile-menu-divider"></div>
                    <div className="profile-menu-item logout" onClick={logout}>
                      <FiLogOut /> Logout
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="recent-section"
          style={{ maxWidth: '600px', margin: '0 auto' }}
        >
          <div className="section-title">Change Account Password</div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Alert className="custom-alert mb-4">{error}</Alert>
              </motion.div>
            )}
            {success && (
              <motion.div
                key="success"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Alert
                  className="mb-4"
                  style={{
                    background: 'rgba(57, 255, 20, 0.1)',
                    border: '1px solid rgba(57, 255, 20, 0.2)',
                    color: '#39FF14',
                    borderRadius: '14px',
                  }}
                >
                  {success}
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit}>
            {/* Current Password */}
            <div className="custom-input-group">
              <label className="form-label fw-bold text-white-50 mb-2">Current Password</label>
              <div className="input-group">
                <span className="input-group-text"><FiLock /></span>
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="btn border-start-0"
                  style={{
                    border: '1px solid var(--border-color)',
                    background: 'rgba(255,255,255,0.03)',
                    color: 'var(--text-muted)',
                    borderRadius: '0 14px 14px 0',
                  }}
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="custom-input-group">
              <label className="form-label fw-bold text-white-50 mb-2">New Password</label>
              <div className="input-group">
                <span className="input-group-text"><FiLock /></span>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="btn border-start-0"
                  style={{
                    border: '1px solid var(--border-color)',
                    background: 'rgba(255,255,255,0.03)',
                    color: 'var(--text-muted)',
                    borderRadius: '0 14px 14px 0',
                  }}
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="custom-input-group mb-4">
              <label className="form-label fw-bold text-white-50 mb-2">Confirm New Password</label>
              <div className="input-group">
                <span className="input-group-text"><FiLock /></span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="Re-type new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="btn border-start-0"
                  style={{
                    border: '1px solid var(--border-color)',
                    background: 'rgba(255,255,255,0.03)',
                    color: 'var(--text-muted)',
                    borderRadius: '0 14px 14px 0',
                  }}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="login-btn w-100 mt-2"
              disabled={loading}
            >
              {loading ? (
                <div className="d-flex align-items-center justify-content-center gap-2">
                  <Spinner animation="border" size="sm" />
                  Updating...
                </div>
              ) : (
                'Update Password'
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ChangePassword;
