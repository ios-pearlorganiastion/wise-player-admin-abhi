import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUserPlus, FiActivity, FiShield, FiEdit2, FiUser, FiCalendar, FiChevronRight } from 'react-icons/fi';
import { useResellers, useToggleResellerStatus, useCreateReseller, useUpdateReseller } from '../../hooks/useResellers';
import { useAuthContext } from '../../contexts/AuthContext';
import ColumnFilter from '../common/ColumnFilter';
import Pagination from '../common/Pagination';
import Sidebar from '../Shared/Sidebar';
import ConfirmModal from '../common/ConfirmModal';
import ResellerDeepDive from './ResellerDeepDive';
import Card from '../common/Card';
import Button from '../common/Button';
import IconButton from '../common/IconButton';
import Spinner from '../common/Spinner';
import ErrorAlert from '../common/ErrorAlert';
import Modal from '../common/Modal';
import Input from '../common/Input';
import HamburgerIcon from '../common/HamburgerIcon';
import ProfileMenu from '../common/ProfileMenu';

const Resellers = () => {
  const { user } = useAuthContext();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [selectedReseller, setSelectedReseller] = useState(null);
  const size = 20;

  const [filters, setFilters] = useState({
    username: '',
    name: '',
    email: ''
  });

  const activeFilters = {
    ...(filters.username ? { username: filters.username } : {}),
    ...(filters.name ? { name: filters.name } : {}),
    ...(filters.email ? { email: filters.email } : {}),
  };

  const { data: resellersData, isLoading, error } = useResellers(page, size, activeFilters);
  const createMutation = useCreateReseller();
  const updateMutation = useUpdateReseller();
  const toggleStatusMutation = useToggleResellerStatus();

  const [showModal, setShowModal] = useState(false);
  const [editingReseller, setEditingReseller] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    credits: ''
  });

  const [confirmState, setConfirmState] = useState({ show: false, reseller: null });

  const handleFilterChange = useCallback((column, value) => {
    setFilters(prev => ({ ...prev, [column]: value }));
    setPage(0);
  }, []);

  const resellers = resellersData?.content || [];

  const handleOpenModal = (e, reseller = null) => {
    if (e) e.stopPropagation();
    if (reseller) {
      setEditingReseller(reseller);
      setFormData({
        username: reseller.username,
        fullName: reseller.fullName,
        email: reseller.email || '',
        password: '',
        credits: reseller.credits !== undefined ? reseller.credits : 0
      });
    } else {
      setEditingReseller(null);
      setFormData({
        username: '',
        fullName: '',
        email: '',
        password: '',
        credits: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingReseller) {
      const updatePayload = {
        fullName: formData.fullName,
        email: formData.email
      };
      if (formData.password) updatePayload.password = formData.password;
      if (formData.credits !== '') updatePayload.credits = Number(formData.credits);

      updateMutation.mutate({ id: editingReseller.id, reseller: updatePayload }, {
        onSuccess: () => setShowModal(false)
      });
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => setShowModal(false)
      });
    }
  };

  const handleStatusToggle = (e, reseller) => {
    if (e) e.stopPropagation();
    setConfirmState({ show: true, reseller });
  };

  const executeStatusToggle = () => {
    const { reseller } = confirmState;
    if (reseller) {
      toggleStatusMutation.mutate(reseller.id, {
        onSuccess: () => setConfirmState({ show: false, reseller: null })
      });
    }
  };

  const gridCols = 'grid-cols-[2fr_1.5fr_1.5fr_100px_100px_130px_120px]';
  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex min-h-screen bg-base">
      <Sidebar
        activePage="resellers"
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
                Manage <span className="text-maroon-light">Resellers</span>
              </h1>
              <p className="hidden sm:block text-subtle text-sm mt-0.5">Admin control for reseller and sub-reseller accounts</p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button className="relative w-9 h-9 hidden sm:flex items-center justify-center rounded-lg hover:bg-surface2 text-subtle">
              <FiActivity />
            </button>
            <ProfileMenu user={user} />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <AnimatePresence mode="wait">
            {!selectedReseller ? (
              <motion.div
                key="list-view"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-semibold text-lg text-ink">Reseller accounts</h2>
                  <Button variant="primary" onClick={(e) => handleOpenModal(e)} className="gap-2">
                    <FiUserPlus /> Add reseller
                  </Button>
                </div>

                <Card noPadding>
                  {isLoading ? (
                    <div className="flex justify-center py-10"><Spinner /></div>
                  ) : error ? (
                    <div className="p-4"><ErrorAlert>Error loading resellers: {error.message}</ErrorAlert></div>
                  ) : (
                    <div className="overflow-x-auto">
                      <div className={`grid ${gridCols} gap-4 px-4 md:px-5 py-3 min-w-[900px] border-b border-line`}>
                        <div className="flex items-center gap-1 text-subtle text-xs font-medium uppercase tracking-wide">
                          Username <ColumnFilter column="username" onFilterChange={handleFilterChange} placeholder="Filter" />
                        </div>
                        <div className="flex items-center gap-1 text-subtle text-xs font-medium uppercase tracking-wide">
                          Full name <ColumnFilter column="name" onFilterChange={handleFilterChange} placeholder="Filter" />
                        </div>
                        <div className="flex items-center gap-1 text-subtle text-xs font-medium uppercase tracking-wide">
                          Email <ColumnFilter column="email" onFilterChange={handleFilterChange} placeholder="Filter" />
                        </div>
                        <div className="text-subtle text-xs font-medium uppercase tracking-wide text-center">Users</div>
                        <div className="text-subtle text-xs font-medium uppercase tracking-wide text-center">Credits</div>
                        <div className="text-subtle text-xs font-medium uppercase tracking-wide">Created</div>
                        <div className="text-subtle text-xs font-medium uppercase tracking-wide text-center">Action</div>
                      </div>

                      {resellers.map((reseller) => (
                        <div
                          key={reseller.id}
                          onClick={() => setSelectedReseller(reseller)}
                          className={`grid ${gridCols} gap-4 items-center px-4 md:px-5 py-3.5 min-w-[900px] border-b border-line last:border-b-0 hover:bg-surface2/60 transition-colors cursor-pointer`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-maroon/15 text-maroon-light flex items-center justify-center shrink-0">
                              <FiUser className="text-xs" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-ink text-sm truncate">{reseller.username}</div>
                              <div className="text-subtle text-xs">{reseller.role}</div>
                            </div>
                          </div>
                          <div className="text-ink text-sm truncate">{reseller.fullName}</div>
                          <div className="text-subtle text-sm truncate">{reseller.email || 'N/A'}</div>
                          <div className="flex justify-center">
                            <span className="text-[11px] font-mono text-sky-400 bg-sky-500/10 rounded-full px-2 py-1">
                              {reseller.totalUsers || 0}
                            </span>
                          </div>
                          <div className="flex justify-center">
                            <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 rounded-full px-2 py-1">
                              {reseller.credits !== undefined ? reseller.credits : 0}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-subtle text-sm">
                            <FiCalendar className="text-xs" />
                            {reseller.createdAt ? new Date(reseller.createdAt).toLocaleDateString() : 'N/A'}
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <IconButton icon={<FiEdit2 />} title="Edit" onClick={(e) => handleOpenModal(e, reseller)} />
                            <IconButton
                              icon={<FiShield />}
                              variant={reseller.active ? 'danger' : 'success'}
                              disabled={toggleStatusMutation.isPending}
                              onClick={(e) => handleStatusToggle(e, reseller)}
                              title={reseller.active ? 'Deactivate' : 'Activate'}
                            />
                            <FiChevronRight className="text-subtle" />
                          </div>
                        </div>
                      ))}

                      {resellers.length === 0 ? (
                        <div className="p-10 text-center text-subtle text-sm">No matching resellers found.</div>
                      ) : null}
                    </div>
                  )}

                  {resellersData && resellersData.totalPages > 1 ? (
                    <div className="px-4 md:px-5 py-4 border-t border-line">
                      <Pagination
                        currentPage={page}
                        totalPages={resellersData.totalPages}
                        onPageChange={(p) => setPage(p)}
                      />
                    </div>
                  ) : null}
                </Card>
              </motion.div>
            ) : (
              <ResellerDeepDive
                reseller={selectedReseller}
                onBack={() => setSelectedReseller(null)}
              />
            )}
          </AnimatePresence>
        </main>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} title={editingReseller ? 'Edit reseller' : 'Add new reseller'}>
        <form onSubmit={handleSubmit}>
          <Input
            label="Username"
            type="text"
            required
            disabled={!!editingReseller}
            value={formData.username}
            onChange={e => setFormData({ ...formData, username: e.target.value })}
            placeholder="e.g. reseller_01"
          />
          <Input
            label="Full name"
            type="text"
            required
            value={formData.fullName}
            onChange={e => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="e.g. John Doe"
          />
          <Input
            label="Email address"
            type="email"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            placeholder="john@example.com"
          />
          <Input
            label={editingReseller ? 'New password (leave blank to keep current)' : 'Password'}
            type="password"
            required={!editingReseller}
            value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
            placeholder="********"
          />
          {editingReseller ? (
            <Input
              label="Credits / balance"
              type="number"
              step="0.01"
              value={formData.credits}
              onChange={e => setFormData({ ...formData, credits: e.target.value })}
              placeholder="Enter current balance"
            />
          ) : null}

          <Button type="submit" variant="primary" className="w-full justify-center mt-2" disabled={isSaving}>
            {isSaving ? 'Saving...' : editingReseller ? 'Update reseller' : 'Create account'}
          </Button>
        </form>
      </Modal>

      <ConfirmModal
        show={confirmState.show}
        onHide={() => setConfirmState({ show: false, reseller: null })}
        onConfirm={executeStatusToggle}
        title={confirmState.reseller?.active ? 'Deactivate reseller?' : 'Activate reseller?'}
        message={`Are you sure you want to ${confirmState.reseller?.active ? 'deactivate' : 'activate'} this reseller account? This will toggle their access to the control panel.`}
        confirmText={confirmState.reseller?.active ? 'Deactivate' : 'Activate'}
        variant={confirmState.reseller?.active ? 'danger' : 'info'}
        isLoading={toggleStatusMutation.isPending}
      />
    </div>
  );
};

export default Resellers;