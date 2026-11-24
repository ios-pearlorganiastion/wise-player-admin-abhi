import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiMail, FiSend, FiSearch, FiEdit2, FiShield, FiTrash2, FiUser, FiUsers, FiUserPlus,
  FiUserCheck, FiUserX, FiActivity, FiInfo, FiCalendar, FiLink, FiCheck,
} from 'react-icons/fi';
import { useInviteAdmin } from '../../hooks/useAuth';
import {
  useAdminAccounts,
  useAdminAccount,
  useCreateAdminAccount,
  useUpdateAdminAccount,
  useToggleAdminStatus,
  useDeleteAdminAccount,
  getAdminApiError,
} from '../../hooks/useAdminManagement';
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
import PasswordInput from '../common/PasswordInput';
import Checkbox from '../common/Checkbox';
import ConfirmModal from '../common/ConfirmModal';
import CopyButton from '../common/CopyButton';
import HamburgerIcon from '../common/HamburgerIcon';
import ProfileMenu from '../common/ProfileMenu';

/* ----------------------------- helpers ----------------------------- */

const PERMISSIONS = [
  { key: 'canCreate', short: 'C', label: 'Create' },
  { key: 'canRead', short: 'R', label: 'Read' },
  { key: 'canUpdate', short: 'U', label: 'Update' },
  { key: 'canDelete', short: 'D', label: 'Delete' },
];

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '—');
const formatDateTime = (value) => (value ? new Date(value).toLocaleString() : '—');
const formatCredits = (value) => Number(value ?? 0).toFixed(2);

// The setup link is emailed to the invitee by the backend. Set this to true ONLY while
// testing (e.g. email not configured yet) to also show the link to the super admin.
const SHOW_INVITE_LINK_FOR_TESTING = false;

const EMPTY_CREATE_FORM = { username: '', fullName: '', email: '', password: '' };

const StatCard = ({ icon, iconBg, iconText, title, value, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.06, duration: 0.35, ease: 'easeOut' }}
  >
    <Card className="flex items-center justify-between hover:-translate-y-0.5 transition-transform duration-150">
      <div className="min-w-0">
        <p className="text-subtle text-xs uppercase tracking-wide truncate">{title}</p>
        <p className="font-mono font-semibold text-xl md:text-2xl text-ink mt-1">{value}</p>
      </div>
      <div className={`w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg} ${iconText}`}>
        {icon}
      </div>
    </Card>
  </motion.div>
);

/** Compact C / R / U / D indicator used in the table rows. */
const PermissionLetters = ({ account }) => (
  <div className="flex items-center justify-center gap-1">
    {PERMISSIONS.map((p) => (
      <span
        key={p.key}
        title={`${p.label}: ${account[p.key] ? 'allowed' : 'not allowed'}`}
        className={`w-5 h-5 rounded-md text-[10px] font-mono font-semibold flex items-center justify-center ${
          account[p.key] ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-subtle/60'
        }`}
      >
        {p.short}
      </span>
    ))}
  </div>
);

/** Full-word permission pills used in the details modal and the role-defaults card. */
const PermissionPills = ({ source }) => (
  <div className="flex flex-wrap gap-2">
    {PERMISSIONS.map((p) => (
      <span
        key={p.key}
        className={`text-[11px] font-medium uppercase tracking-wide rounded-full px-2.5 py-1 ${
          source?.[p.key] ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-subtle'
        }`}
      >
        {p.label}
      </span>
    ))}
  </div>
);

const DetailRow = ({ label, children }) => (
  <div className="flex items-start justify-between gap-4 py-2.5 border-b border-line last:border-b-0">
    <span className="text-subtle text-xs font-medium uppercase tracking-wide shrink-0">{label}</span>
    <span className="text-ink text-sm text-right break-all">{children}</span>
  </div>
);

/* ------------------------------ page ------------------------------- */

const AdminManagement = () => {
  const { user } = useAuthContext();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // --- Data ---
  const { data: listData, isLoading, error } = useAdminAccounts();
  const { data: permissionsData } = useCrudPermissions();
  const createMutation = useCreateAdminAccount();
  const updateMutation = useUpdateAdminAccount();
  const toggleStatusMutation = useToggleAdminStatus();
  const deleteMutation = useDeleteAdminAccount();
  const inviteMutation = useInviteAdmin();

  const bulkPermissions = listData?.bulkPermissions || null;
  const admins = useMemo(
    () => (listData?.content || []).filter((a) => a.role === 'ADMIN'),
    [listData]
  );

  // --- Search ---
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return admins.filter(
      (a) =>
        !q ||
        a.username?.toLowerCase().includes(q) ||
        a.fullName?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q)
    );
  }, [admins, search]);

  const stats = useMemo(() => {
    const active = admins.filter((a) => a.active).length;
    return { total: admins.length, active, inactive: admins.length - active };
  }, [admins]);

  // Whether this admin's permissions were individually customized (read-only /crud-permissions).
  const getCustomization = (accountId) =>
    permissionsData?.individualPermissions?.find((p) => p.adminId === accountId) || null;

  // --- Page-level notice (success / error) that auto-dismisses ---
  const [notice, setNotice] = useState(null);
  useEffect(() => {
    if (!notice) return undefined;
    const t = setTimeout(() => setNotice(null), 4500);
    return () => clearTimeout(t);
  }, [notice]);

  /* ----------------------------- Invite ----------------------------- */
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [inviteSent, setInviteSent] = useState(false);

  const openInvite = () => {
    setInviteEmail('');
    setInviteError('');
    setInviteLink('');
    setInviteSent(false);
    setShowInvite(true);
  };

  const handleInvite = (e) => {
    e.preventDefault();
    setInviteError('');
    inviteMutation.mutate(
      { email: inviteEmail.trim() },
      {
        onSuccess: (data) => {
          if (SHOW_INVITE_LINK_FOR_TESTING) {
            const path = data?.inviteUrl || `/admin/setup?token=${data?.token}`;
            setInviteLink(`${window.location.origin}${path}`);
          }
          setInviteSent(true);
        },
        onError: (err) => setInviteError(err.message || 'Failed to send invitation.'),
      }
    );
  };

  /* ----------------------------- Create ----------------------------- */
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM);
  const [createError, setCreateError] = useState('');

  const openCreate = () => {
    setCreateForm(EMPTY_CREATE_FORM);
    setCreateError('');
    setShowCreate(true);
  };

  const handleCreate = (e) => {
    e.preventDefault();
    setCreateError('');
    if (createForm.password.length < 8) {
      setCreateError('Password must be at least 8 characters long.');
      return;
    }
    createMutation.mutate(
      {
        username: createForm.username.trim(),
        email: createForm.email.trim(),
        password: createForm.password,
        fullName: createForm.fullName.trim(),
        role: 'ADMIN',
      },
      {
        onSuccess: (created) => {
          setShowCreate(false);
          setNotice({ type: 'success', text: `Admin "${created.username}" created successfully.` });
        },
        onError: (err) => setCreateError(getAdminApiError(err, 'Failed to create admin.')),
      }
    );
  };

  /* ----------------------------- Details ---------------------------- */
  const [detailsAccount, setDetailsAccount] = useState(null);
  // Fetch the latest copy via GET /{id}; show the list row instantly while it loads.
  const { data: detailData, isLoading: isDetailLoading } = useAdminAccount(detailsAccount?.id || null);
  const detailView = detailData || detailsAccount;

  /* ------------------------------ Edit ------------------------------ */
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editError, setEditError] = useState('');

  const openEdit = (account) => {
    setEditingAccount(account);
    setEditForm({
      username: account.username || '',
      email: account.email || '',
      fullName: account.fullName || '',
      credits: account.credits ?? 0,
      active: !!account.active,
      canCreate: !!account.canCreate,
      canRead: !!account.canRead,
      canUpdate: !!account.canUpdate,
      canDelete: !!account.canDelete,
    });
    setEditError('');
    setShowEditModal(true);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    setEditError('');
    updateMutation.mutate(
      {
        id: editingAccount.id,
        payload: { ...editForm, username: editForm.username.trim(), credits: Number(editForm.credits) || 0 },
      },
      {
        onSuccess: (updated) => {
          setShowEditModal(false);
          setNotice({ type: 'success', text: `Admin "${updated.username}" updated successfully.` });
        },
        onError: (err) => setEditError(getAdminApiError(err, 'Failed to update account.')),
      }
    );
  };

  /* ---------------------- Status toggle / Delete -------------------- */
  const [statusConfirm, setStatusConfirm] = useState({ show: false, account: null });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, account: null });

  const executeToggleStatus = () => {
    const { account } = statusConfirm;
    if (!account) return;
    toggleStatusMutation.mutate(account.id, {
      onSuccess: (updated) => {
        setStatusConfirm({ show: false, account: null });
        setNotice({
          type: 'success',
          text: `Admin "${updated.username}" is now ${updated.active ? 'active' : 'inactive'}.`,
        });
      },
      onError: (err) => {
        setStatusConfirm({ show: false, account: null });
        setNotice({ type: 'error', text: getAdminApiError(err, 'Failed to change account status.') });
      },
    });
  };

  const executeDelete = () => {
    const { account } = deleteConfirm;
    if (!account) return;
    deleteMutation.mutate(account.id, {
      onSuccess: (res) => {
        setDeleteConfirm({ show: false, account: null });
        if (detailsAccount?.id === account.id) setDetailsAccount(null);
        setNotice({ type: 'success', text: res?.message || 'Admin deleted successfully.' });
      },
      onError: (err) => {
        setDeleteConfirm({ show: false, account: null });
        setNotice({ type: 'error', text: getAdminApiError(err, 'Failed to delete admin.') });
      },
    });
  };

  /* ------------------------------ render ---------------------------- */
  const gridCols = 'grid-cols-[minmax(170px,1.8fr)_minmax(160px,1.8fr)_90px_120px_100px_130px]';

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
              <p className="hidden sm:block text-subtle text-sm mt-0.5">Create, invite, and control admin access</p>
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
          {notice ? (
            <ErrorAlert variant={notice.type === 'success' ? 'success' : 'danger'}>{notice.text}</ErrorAlert>
          ) : null}

          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            <StatCard index={0} title="Total admins" value={stats.total} icon={<FiUsers />} iconBg="bg-maroon/15" iconText="text-maroon-light" />
            <StatCard index={1} title="Active" value={stats.active} icon={<FiUserCheck />} iconBg="bg-emerald-500/10" iconText="text-emerald-400" />
            <StatCard index={2} title="Inactive" value={stats.inactive} icon={<FiUserX />} iconBg="bg-white/5" iconText="text-subtle" />
          </div>

          {/* Role-level default permissions (bulkPermissions) */}
          {bulkPermissions ? (
            <Card className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-display font-semibold text-ink text-base">Default admin permissions</h2>
                <p className="text-subtle text-xs mt-1">
                  Role-wide defaults for {bulkPermissions.role === 'ADMIN' ? 'all admins' : bulkPermissions.role}
                  {bulkPermissions.updatedAt ? ` · updated ${formatDateTime(bulkPermissions.updatedAt)}` : ''}
                </p>
              </div>
              <PermissionPills source={bulkPermissions} />
            </Card>
          ) : null}

          {/* Admin accounts */}
          <div>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
              <h2 className="font-display font-semibold text-ink text-lg">Admin accounts</h2>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
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
                <div className="flex items-center gap-3">
                  <Button variant="secondary" onClick={openInvite} className="gap-2 flex-1 sm:flex-none justify-center">
                    <FiMail /> Invite admin
                  </Button>
                  <Button variant="primary" onClick={openCreate} className="gap-2 flex-1 sm:flex-none justify-center">
                    <FiUserPlus /> Add admin
                  </Button>
                </div>
              </div>
            </div>

            <Card noPadding>
              {isLoading ? (
                <div className="flex justify-center py-10"><Spinner /></div>
              ) : error ? (
                <div className="p-4"><ErrorAlert>Error loading accounts: {error.message}</ErrorAlert></div>
              ) : (
                <>
                  {/* Desktop / tablet table */}
                  <div className="hidden md:block overflow-x-auto">
                    <div className={`grid ${gridCols} gap-3 px-4 md:px-5 py-3 min-w-[880px] border-b border-line`}>
                      <div className="text-subtle text-xs font-medium uppercase tracking-wide">User</div>
                      <div className="text-subtle text-xs font-medium uppercase tracking-wide">Email</div>
                      <div className="text-subtle text-xs font-medium uppercase tracking-wide text-right">Credits</div>
                      <div className="text-subtle text-xs font-medium uppercase tracking-wide text-center">Permissions</div>
                      <div className="text-subtle text-xs font-medium uppercase tracking-wide text-center">Status</div>
                      <div className="text-subtle text-xs font-medium uppercase tracking-wide text-center">Actions</div>
                    </div>

                    {filtered.map((account) => {
                      const customization = getCustomization(account.id);
                      return (
                        <div
                          key={account.id}
                          onClick={() => setDetailsAccount(account)}
                          className={`grid ${gridCols} gap-3 items-center px-4 md:px-5 py-3.5 min-w-[880px] border-b border-line last:border-b-0 hover:bg-surface2/60 transition-colors cursor-pointer`}
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
                                    title={`Permissions updated ${formatDateTime(customization.updatedAt)}`}
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
                          <div className="font-mono text-amber-400 text-sm text-right">{formatCredits(account.credits)}</div>
                          <PermissionLetters account={account} />
                          <div className="flex justify-center">
                            <Badge status={account.active ? 'active' : 'inactive'}>{account.active ? 'Active' : 'Inactive'}</Badge>
                          </div>
                          <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <IconButton icon={<FiEdit2 />} title="Edit" onClick={() => openEdit(account)} />
                            <IconButton
                              icon={<FiShield />}
                              variant={account.active ? 'danger' : 'success'}
                              title={account.active ? 'Deactivate' : 'Activate'}
                              disabled={toggleStatusMutation.isPending}
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
                  </div>

                  {/* Mobile card list */}
                  <div className="md:hidden divide-y divide-line">
                    {filtered.map((account) => (
                      <div key={account.id} className="p-4 space-y-3" onClick={() => setDetailsAccount(account)}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-9 h-9 rounded-lg bg-maroon/15 text-maroon-light flex items-center justify-center shrink-0">
                              <FiUser className="text-sm" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-ink text-sm truncate">{account.username}</div>
                              <div className="text-subtle text-xs truncate">{account.fullName || 'No name'}</div>
                            </div>
                          </div>
                          <Badge status={account.active ? 'active' : 'inactive'}>{account.active ? 'Active' : 'Inactive'}</Badge>
                        </div>
                        <div className="text-subtle text-sm truncate">{account.email || 'N/A'}</div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-mono text-amber-400 text-sm">{formatCredits(account.credits)}</span>
                          <PermissionLetters account={account} />
                        </div>
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <IconButton icon={<FiEdit2 />} title="Edit" onClick={() => openEdit(account)} />
                          <IconButton
                            icon={<FiShield />}
                            variant={account.active ? 'danger' : 'success'}
                            title={account.active ? 'Deactivate' : 'Activate'}
                            disabled={toggleStatusMutation.isPending}
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
                    ))}
                  </div>

                  {filtered.length === 0 ? (
                    <div className="p-10 text-center text-subtle text-sm">
                      {admins.length === 0 ? 'No admin accounts yet. Add or invite one to get started.' : 'No matching admin accounts found.'}
                    </div>
                  ) : null}
                </>
              )}
            </Card>
          </div>
        </main>
      </div>

      {/* ---------------------------- Invite modal --------------------------- */}
      <Modal show={showInvite} onHide={() => setShowInvite(false)} title="Invite new admin">
        {inviteSent ? (
          <div>
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl">
                <FiCheck />
              </div>
            </div>
            <h3 className="font-display font-semibold text-ink text-base text-center mb-1.5">Invitation sent</h3>
            <p className="text-subtle text-sm text-center mb-5">
              We emailed a setup link to <span className="text-ink font-medium">{inviteEmail}</span>.
              They can open it to choose a username and password.
            </p>
            {inviteLink ? (
              <div className="mb-5">
                <p className="text-subtle text-xs font-medium mb-1.5">Setup link (testing only)</p>
                <div className="flex items-center gap-2 bg-surface2 border border-line rounded-lg px-3 h-11">
                  <FiLink className="text-subtle text-sm shrink-0" />
                  <span className="text-ink text-xs font-mono truncate flex-1">{inviteLink}</span>
                  <CopyButton value={inviteLink} />
                </div>
              </div>
            ) : null}
            <div className="flex items-center gap-3">
              <Button variant="secondary" className="flex-1 justify-center" onClick={openInvite}>
                Invite another
              </Button>
              <Button variant="primary" className="flex-1 justify-center" onClick={() => setShowInvite(false)}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleInvite}>
            <p className="text-subtle text-sm mb-4">Enter the email of the person you want to invite as an administrator.</p>
            {inviteError ? <div className="mb-4"><ErrorAlert>{inviteError}</ErrorAlert></div> : null}
            <Input
              label="Email address"
              type="email"
              required
              icon={<FiMail />}
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="admin@example.com"
            />
            <Button type="submit" variant="primary" className="w-full justify-center gap-2" disabled={inviteMutation.isPending}>
              {inviteMutation.isPending ? 'Sending...' : 'Send invitation'} <FiSend />
            </Button>
          </form>
        )}
      </Modal>

      {/* ---------------------------- Create modal --------------------------- */}
      <Modal show={showCreate} onHide={() => setShowCreate(false)} title="Add new admin">
        <form onSubmit={handleCreate}>
          {createError ? <div className="mb-4"><ErrorAlert>{createError}</ErrorAlert></div> : null}

          <Input label="Username" type="text" required value={createForm.username} placeholder="e.g. john_admin"
            onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })} />
          <Input label="Full name" type="text" required value={createForm.fullName} placeholder="e.g. John Smith"
            onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })} />
          <Input label="Email address" type="email" required value={createForm.email} placeholder="john@example.com"
            onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} />
          <PasswordInput label="Password" required minLength={8} value={createForm.password} placeholder="At least 8 characters"
            onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} />

          <p className="text-subtle text-xs mb-4">
            The account is created with the <span className="text-ink font-medium">Admin</span> role and the default permissions.
          </p>

          <Button type="submit" variant="primary" className="w-full justify-center" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creating...' : 'Create account'}
          </Button>
        </form>
      </Modal>

      {/* ---------------------------- Details modal -------------------------- */}
      <Modal show={!!detailsAccount} onHide={() => setDetailsAccount(null)} title="Admin details">
        {detailView ? (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-maroon/15 text-maroon-light flex items-center justify-center shrink-0">
                <FiUser className="text-lg" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-display font-semibold text-ink text-base truncate">{detailView.fullName || detailView.username}</div>
                <div className="text-subtle text-xs truncate">@{detailView.username}</div>
              </div>
              <Badge status={detailView.active ? 'active' : 'inactive'}>{detailView.active ? 'Active' : 'Inactive'}</Badge>
            </div>

            {isDetailLoading ? <div className="flex justify-center py-2"><Spinner size={16} /></div> : null}

            <div className="mb-4">
              <DetailRow label="Email">{detailView.email || 'N/A'}</DetailRow>
              <DetailRow label="Role">{detailView.role}</DetailRow>
              <DetailRow label="Credits"><span className="font-mono text-amber-400">{formatCredits(detailView.credits)}</span></DetailRow>
              <DetailRow label="Created">
                <span className="inline-flex items-center gap-1.5"><FiCalendar className="text-subtle text-xs" />{formatDateTime(detailView.createdAt)}</span>
              </DetailRow>
            </div>

            <p className="text-subtle text-xs font-medium uppercase tracking-wide mb-2.5">Permissions</p>
            <div className="mb-5"><PermissionPills source={detailView} /></div>

            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                className="flex-1 justify-center gap-2"
                onClick={() => { const acc = detailView; setDetailsAccount(null); openEdit(acc); }}
              >
                <FiEdit2 /> Edit
              </Button>
              <Button variant="primary" className="flex-1 justify-center" onClick={() => setDetailsAccount(null)}>
                Close
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* ----------------------------- Edit modal ---------------------------- */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} title={`Edit ${editingAccount?.username || ''}`}>
        {editForm ? (
          <form onSubmit={handleUpdate}>
            {editError ? <div className="mb-4"><ErrorAlert>{editError}</ErrorAlert></div> : null}

            <Input label="Username" type="text" required value={editForm.username} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} />
            <Input label="Email address" type="email" required value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
            <Input label="Full name" type="text" value={editForm.fullName} onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })} />
            <Input label="Credits" type="number" step="0.01" min="0" value={editForm.credits} onChange={(e) => setEditForm({ ...editForm, credits: e.target.value })} />

            <div className="mb-4">
              <Checkbox label="Account active" checked={editForm.active} onChange={(val) => setEditForm({ ...editForm, active: val })} />
            </div>

            <div className="mb-2">
              <p className="text-subtle text-xs font-medium uppercase tracking-wide mb-2.5">Permissions</p>
              <div className="grid grid-cols-2 gap-y-2.5">
                {PERMISSIONS.map((p) => (
                  <Checkbox
                    key={p.key}
                    label={`Can ${p.label.toLowerCase()}`}
                    checked={editForm[p.key]}
                    onChange={(val) => setEditForm({ ...editForm, [p.key]: val })}
                  />
                ))}
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full justify-center mt-4" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save changes'}
            </Button>
          </form>
        ) : null}
      </Modal>

      {/* --------------------------- Confirm modals -------------------------- */}
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
