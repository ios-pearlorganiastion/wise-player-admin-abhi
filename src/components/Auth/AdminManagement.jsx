import React, { useState, useMemo } from 'react';
import { FiMail, FiSend, FiSearch, FiEdit2, FiShield, FiTrash2, FiUser, FiActivity, FiInfo } from 'react-icons/fi';
import { useInviteAdmin } from '../../hooks/useAuth';
import { useAdminAccounts, useUpdateAdminAccount, useToggleAdminStatus, useDeleteAdminAccount } from '../../hooks/useAdminManagement';
import { useCrudPermissions } from '../../hooks/useCrudPermissions';
import { useAuthContext } from '../../contexts/AuthContext';
import Sidebar from '../Shared/Sidebar';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import IconButton from '../common/IconButton';
import Spinner from '../common/Spinner';
import ErrorAlert from '../common/ErrorAlert';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Checkbox from '../common/Checkbox';
import ConfirmModal from '../common/ConfirmModal';
import HamburgerIcon from '../common/HamburgerIcon';
import ProfileMenu from '../common/ProfileMenu';

const AdminManagement = () => {
  const { user } = useAuthContext();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // --- Invite flow ---
  const [email, setEmail] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');
  const inviteMutation = useInviteAdmin();

  const handleInvite = (e) => {
    e.preventDefault();
    setInviteError('');
    setInviteSuccess('');

    inviteMutation.mutate(
      { email },
      {
        onSuccess: () => {
          setInviteSuccess("Invitation sent!");
          setEmail('');
        },
        onError: (err) => {
          setInviteError(err.message || "Failed to send invitation.");
        }
      }
    );
  };

  // --- Admin accounts directory (ADMIN role only) ---
  const [search, setSearch] = useState('');
  const { data: allAccounts, isLoading, error } = useAdminAccounts();
  const updateMutation = useUpdateAdminAccount();
  const toggleStatusMutation = useToggleAdminStatus();
  const deleteMutation = useDeleteAdminAccount();

  const { data: permissionsData } = useCrudPermissions();

  const admins = useMemo(() => (allAccounts || []).filter(a => a.role === 'ADMIN'), [allAccounts]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return admins.filter(a =>
      !q ||
      a.username?.toLowerCase().includes(q) ||
      a.fullName?.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q)
    );
  }, [admins, search]);

  // Look up whether this admin's permissions were individually customized,
  // and when — sourced from the read-only /crud-permissions endpoint.
  const getCustomization = (accountId) => {
    return permissionsData?.individualPermissions?.find(p => p.adminId === accountId) || null;
  };

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editError, setEditError] = useState('');

  const [statusConfirm, setStatusConfirm] = useState({ show: false, account: null });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, account: null });

  const openEdit = (account) => {
    setEditingAccount(account);
    setEditForm({
      username: account.username || '',
      email: account.email || '',
      fullName: account.fullName || '',
      credits: account.credits ?? 0,
      active: account.active,
      canCreate: account.canCreate,
      canRead: account.canRead,
      canUpdate: account.canUpdate,
      canDelete: account.canDelete,
    });
    setEditError('');
    setShowEditModal(true);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    setEditError('');
    updateMutation.mutate(
      { id: editingAccount.id, payload: { ...editForm, credits: Number(editForm.credits) } },
      {
        onSuccess: () => setShowEditModal(false),
        onError: (err) => setEditError(err.response?.data?.message || 'Failed to update account.'),
      }
    );
  };

  const executeToggleStatus = () => {
    const { account } = statusConfirm;
    if (account) {
      toggleStatusMutation.mutate(account.id, {
        onSuccess: () => setStatusConfirm({ show: false, account: null }),
      });
    }
  };

  const executeDelete = () => {
    const { account } = deleteConfirm;
    if (account) {
      deleteMutation.mutate(account.id, {
        onSuccess: () => setDeleteConfirm({ show: false, account: null }),
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-base">
      <Sidebar
        activePage="admin-management"
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 md:h-20 shrink-0 flex items-center justify-between gap-4 px-4 md:px-6 border-b border-line">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden text-subtle w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface2 shrink-0"
              aria-label="Open menu"
            >
              <HamburgerIcon />
            </button>
            <div className="min-w-0">
              <h1 className="font-display font-semibold text-lg md:text-xl text-ink truncate">
                Admin <span className="text-maroon-light">Management</span>
              </h1>
              <p className="hidden sm:block text-subtle text-sm mt-0.5">Invite, manage, and control admin access</p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button className="relative w-9 h-9 hidden sm:flex items-center justify-center rounded-lg hover:bg-surface2 text-subtle">
              <FiActivity />
            </button>
            <ProfileMenu user={user} />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">

          {/* Invite section */}
          <Card>
            <div >
              <h2 className="font-display font-semibold text-ink text-base mb-1.5">Invite new admin</h2>
              <p className="text-subtle text-sm mb-5">Enter the email of the person you want to invite as an administrator.</p>

              {inviteError ? <div className="mb-4 text-left"><ErrorAlert>{inviteError}</ErrorAlert></div> : null}
              {inviteSuccess ? <div className="mb-4 text-left"><ErrorAlert variant="success">{inviteSuccess}</ErrorAlert></div> : null}

              <form onSubmit={handleInvite} className="flex flex-wrap gap-3 items-center justify-center">
                <div className="relative flex-1 min-w-[220px]">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle text-sm pointer-events-none" />
             <input
                  type="email"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   placeholder="admin@example.com"
                   required
                   className="w-full bg-surface2 border border-line rounded-lg pl-9 pr-3 h-11 text-sm text-ink outline-none focus:border-maroon-light transition-colors placeholder:text-subtle"
                 />
               </div>
                <Button
                  type="submit"
                  variant="primary"
                  className="gap-2 shrink-0 h-11 justify-center"
                  disabled={inviteMutation.isPending}
                >
                  {inviteMutation.isPending ? "Sending..." : "Send invitation"} <FiSend />
                </Button>
              </form>
            </div>
          </Card>

          {/* Admin accounts */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h2 className="font-display font-semibold text-ink text-lg">Admin accounts</h2>
              <div className="relative w-full sm:w-64">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle text-sm pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search username, name, email..."
                  className="w-full bg-surface2 border border-line rounded-lg pl-9 pr-3 h-10 text-sm text-ink outline-none focus:border-maroon-light transition-colors placeholder:text-subtle"
                />
              </div>
            </div>

            <Card noPadding>
              {isLoading ? (
                <div className="flex justify-center py-10"><Spinner /></div>
              ) : error ? (
                <div className="p-4"><ErrorAlert>Error loading accounts: {error.message}</ErrorAlert></div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="grid grid-cols-[minmax(160px,1.8fr)_minmax(150px,1.8fr)_100px_100px_120px] gap-3 px-4 md:px-5 py-3 min-w-[760px] border-b border-line">
                    <div className="text-subtle text-xs font-medium uppercase tracking-wide">User</div>
                    <div className="text-subtle text-xs font-medium uppercase tracking-wide">Email</div>
                    <div className="text-subtle text-xs font-medium uppercase tracking-wide text-right">Credits</div>
                    <div className="text-subtle text-xs font-medium uppercase tracking-wide text-center">Status</div>
                    <div className="text-subtle text-xs font-medium uppercase tracking-wide text-center">Actions</div>
                  </div>

                  {filtered.map((account) => {
                    const customization = getCustomization(account.id);
                    return (
                      <div
                        key={account.id}
                        className="grid grid-cols-[minmax(160px,1.8fr)_minmax(150px,1.8fr)_100px_100px_120px] gap-3 items-center px-4 md:px-5 py-3.5 min-w-[760px] border-b border-line last:border-b-0 hover:bg-surface2/60 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-maroon/15 text-maroon-light flex items-center justify-center shrink-0">
                            <FiUser className="text-xs" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium text-ink text-sm truncate">{account.username}</span>
                              {customization?.recentlyChangedByMe ? (
                                <span
                                  title={`Permissions updated ${new Date(customization.updatedAt).toLocaleString()}`}
                                  className="shrink-0"
                                >
                                  <FiInfo className="text-amber-400 text-xs" />
                                </span>
                              ) : null}
                            </div>
                            <div className="text-subtle text-xs truncate">{account.fullName || 'No name'}</div>
                          </div>
                        </div>
                        <div className="text-subtle text-sm truncate">{account.email || 'N/A'}</div>
                        <div className="font-mono text-amber-400 text-sm text-right">{account.credits?.toFixed(2)}</div>
                        <div className="flex justify-center">
                          <Badge status={account.active ? 'active' : 'inactive'}>{account.active ? 'Active' : 'Inactive'}</Badge>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <IconButton icon={<FiEdit2 />} title="Edit" onClick={() => openEdit(account)} />
                          <IconButton
                            icon={<FiShield />}
                            variant={account.active ? 'danger' : 'success'}
                            title={account.active ? 'Deactivate' : 'Activate'}
                            onClick={() => setStatusConfirm({ show: true, account })}
                          />
                          <IconButton
                            icon={<FiTrash2 />}
                            variant="danger"
                            title="Delete"
                            onClick={() => setDeleteConfirm({ show: true, account })}
                          />
                        </div>
                      </div>
                    );
                  })}

                  {filtered.length === 0 ? (
                    <div className="p-10 text-center text-subtle text-sm">No matching admin accounts found.</div>
                  ) : null}
                </div>
              )}
            </Card>
          </div>
        </main>
      </div>

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} title={`Edit ${editingAccount?.username || ''}`}>
        {editForm ? (
          <form onSubmit={handleUpdate}>
            {editError ? <div className="mb-4"><ErrorAlert>{editError}</ErrorAlert></div> : null}

            <Input label="Username" type="text" required value={editForm.username} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} />
            <Input label="Email address" type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
            <Input label="Full name" type="text" value={editForm.fullName} onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })} />
            <Input label="Credits" type="number" step="0.01" value={editForm.credits} onChange={(e) => setEditForm({ ...editForm, credits: e.target.value })} />

            <div className="mb-4">
              <Checkbox label="Account active" checked={editForm.active} onChange={(val) => setEditForm({ ...editForm, active: val })} />
            </div>

            <div className="mb-2">
              <p className="text-subtle text-xs font-medium uppercase tracking-wide mb-2.5">Permissions</p>
              <div className="grid grid-cols-2 gap-y-2.5">
                <Checkbox label="Can create" checked={editForm.canCreate} onChange={(val) => setEditForm({ ...editForm, canCreate: val })} />
                <Checkbox label="Can read" checked={editForm.canRead} onChange={(val) => setEditForm({ ...editForm, canRead: val })} />
                <Checkbox label="Can update" checked={editForm.canUpdate} onChange={(val) => setEditForm({ ...editForm, canUpdate: val })} />
                <Checkbox label="Can delete" checked={editForm.canDelete} onChange={(val) => setEditForm({ ...editForm, canDelete: val })} />
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full justify-center mt-4" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save changes'}
            </Button>
          </form>
        ) : null}
      </Modal>

      <ConfirmModal
        show={statusConfirm.show}
        onHide={() => setStatusConfirm({ show: false, account: null })}
        onConfirm={executeToggleStatus}
        title={statusConfirm.account?.active ? 'Deactivate account?' : 'Activate account?'}
        message={`Are you sure you want to ${statusConfirm.account?.active ? 'deactivate' : 'activate'} "${statusConfirm.account?.username}"? This will affect their access to the platform.`}
        confirmText={statusConfirm.account?.active ? 'Deactivate' : 'Activate'}
        variant={statusConfirm.account?.active ? 'danger' : 'info'}
        isLoading={toggleStatusMutation.isPending}
      />

      <ConfirmModal
        show={deleteConfirm.show}
        onHide={() => setDeleteConfirm({ show: false, account: null })}
        onConfirm={executeDelete}
        title="Permanently delete account?"
        message={`Are you sure you want to delete "${deleteConfirm.account?.username}"? This action is permanent and cannot be undone.`}
        confirmText="Delete completely"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default AdminManagement;