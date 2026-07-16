import React, { useState, useEffect } from 'react';
import { FiActivity, FiPlus } from 'react-icons/fi';
import { useSubscriptions, useCreateManualSubscription, useDeleteSubscription } from '../../hooks/useSubscriptions';
import { useAllPlans } from '../../hooks/usePlans';
import { useAuthContext } from '../../contexts/AuthContext';
import ColumnFilter from '../common/ColumnFilter';
import Pagination from '../common/Pagination';
import Sidebar from '../Shared/Sidebar';
import ConfirmModal from '../common/ConfirmModal';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import ErrorAlert from '../common/ErrorAlert';
import Modal from '../common/Modal';
import Input from '../common/Input';
import SelectDropdown from '../common/SelectDropdown';
import HamburgerIcon from '../common/HamburgerIcon';
import ProfileMenu from '../common/ProfileMenu';

const Subscriptions = () => {
  const { user } = useAuthContext();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [page, setPage] = useState(0);
  const size = 20;

  const [filters, setFilters] = useState({
    deviceId: '',
    plan: '',
    status: ''
  });

  const activeFilters = {
    ...(filters.deviceId ? { deviceId: filters.deviceId } : {}),
    ...(filters.plan ? { plan: filters.plan } : {}),
    ...(filters.status ? { status: filters.status } : {}),
  };

  const { data: subsData, isLoading, error } = useSubscriptions(page, size, activeFilters);
  const createSubMutation = useCreateManualSubscription();
  const deleteSubMutation = useDeleteSubscription();
  const { data: allPlans = [], isLoading: isPlansLoading } = useAllPlans();

  const [showModal, setShowModal] = useState(false);
  const [modalPlanOpen, setModalPlanOpen] = useState(false);
  const [newSub, setNewSub] = useState({ deviceId: '', planId: '', plan: '' });
  const [confirmState, setConfirmState] = useState({ show: false, subId: null });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(0);
  }, [filters]);

  const handleFilterChange = (column, value) => {
    setFilters(prev => ({ ...prev, [column]: value }));
  };

  const subscriptions = subsData?.content || [];

  const handleCreate = (e) => {
    e.preventDefault();
    createSubMutation.mutate({ deviceId: newSub.deviceId, plan: newSub.plan }, {
      onSuccess: () => {
        setShowModal(false);
        setNewSub({ deviceId: '', planId: '', plan: '' });
        setModalPlanOpen(false);
      }
    });
  };

  const executeDelete = () => {
    if (confirmState.subId) {
      deleteSubMutation.mutate(confirmState.subId, {
        onSuccess: () => setConfirmState({ show: false, subId: null })
      });
    }
  };

  const gridCols = 'grid-cols-[70px_minmax(180px,2fr)_120px_120px_120px_110px]';

  return (
    <div className="flex min-h-screen bg-base">
      <Sidebar
        activePage="subscriptions"
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
                Active <span className="text-maroon-light">Subscriptions</span>
              </h1>
              <p className="hidden sm:block text-subtle text-sm mt-0.5">Manage user plans and manual overrides</p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button className="relative w-9 h-9 hidden sm:flex items-center justify-center rounded-lg hover:bg-surface2 text-subtle">
              <FiActivity />
            </button>
            <ProfileMenu user={user} />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">

          <div className="flex justify-end">
            <Button variant="primary" onClick={() => setShowModal(true)} className="gap-2">
              <FiPlus /> Manual subscription
            </Button>
          </div>

          <Card noPadding>
            <div className="px-4 md:px-5 py-4 border-b border-line">
              <h2 className="font-display font-semibold text-sm md:text-base text-ink">Subscription list</h2>
            </div>

            <div className="overflow-x-auto">
              <div className={`grid ${gridCols} gap-4 px-4 md:px-5 py-3 min-w-[860px] border-b border-line`}>
                <div className="text-subtle text-xs font-medium uppercase tracking-wide">Id</div>
                <div className="flex items-center gap-1 text-subtle text-xs font-medium uppercase tracking-wide">
                  Mac address <ColumnFilter column="deviceId" onFilterChange={handleFilterChange} placeholder="MAC/ID" />
                </div>
                <div className="flex items-center gap-1 text-subtle text-xs font-medium uppercase tracking-wide">
                  Plan
                  <ColumnFilter
                    column="plan"
                    onFilterChange={handleFilterChange}
                    placeholder="Plan"
                    options={[{ label: 'Annual', value: 'ANNUAL' }, { label: 'Lifetime', value: 'LIFETIME' }, { label: 'Trial', value: 'TRIAL' }]}
                  />
                </div>
                <div className="text-subtle text-xs font-medium uppercase tracking-wide">Start date</div>
                <div className="text-subtle text-xs font-medium uppercase tracking-wide">End date</div>
                <div className="flex items-center gap-1 justify-end text-subtle text-xs font-medium uppercase tracking-wide">
                  Status
                  <ColumnFilter
                    column="status"
                    onFilterChange={handleFilterChange}
                    placeholder="Status"
                    options={[{ label: 'Active', value: 'ACTIVE' }, { label: 'Trial', value: 'TRIAL' }, { label: 'Expired', value: 'EXPIRED' }, { label: 'Cancelled', value: 'CANCELLED' }]}
                    alignRight
                  />
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-10"><Spinner /></div>
              ) : error ? (
                <div className="p-4"><ErrorAlert>Error loading subscriptions: {error.message}</ErrorAlert></div>
              ) : subscriptions.length === 0 ? (
                <div className="p-8 text-center text-subtle text-sm">No subscriptions found.</div>
              ) : (
                subscriptions.map((sub) => (
                  <div
                    key={sub.id}
                    className={`grid ${gridCols} gap-4 items-center px-4 md:px-5 py-3.5 min-w-[860px] border-b border-line last:border-b-0 hover:bg-surface2/60 transition-colors`}
                  >
                    <div className="font-mono text-subtle text-xs">#{sub.id}</div>
                    <div className="font-medium text-ink text-sm truncate" title={sub.macAddress}>
                      {sub.macAddress || <span className="text-subtle italic">N/A</span>}
                    </div>
                    <div className="text-ink text-sm truncate">{sub.plan || sub.planName || sub.subscriptionPlan}</div>
                    <div className="text-subtle text-sm">{new Date(sub.startDate).toLocaleDateString()}</div>
                    <div className="text-subtle text-sm">{new Date(sub.endDate).toLocaleDateString()}</div>
                    <div className="flex justify-end">
                      <Badge status={sub.status || 'expired'}>{sub.status}</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>

            {subsData && subsData.totalPages > 1 ? (
              <div className="px-4 md:px-5 py-4 border-t border-line">
                <Pagination
                  currentPage={page}
                  totalPages={subsData.totalPages}
                  onPageChange={(p) => setPage(p)}
                />
              </div>
            ) : null}
          </Card>
        </main>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} title="Manual subscription">
        <form onSubmit={handleCreate}>
          <Input
            label="Device ID (UUID)"
            type="text"
            required
            value={newSub.deviceId}
            onChange={e => setNewSub({ ...newSub, deviceId: e.target.value })}
          />

          <SelectDropdown
            label="Select subscription plan"
            placeholder="Choose a plan..."
            isLoading={isPlansLoading}
            selectedLabel={newSub.plan}
            isOpen={modalPlanOpen}
            onToggle={() => setModalPlanOpen(!modalPlanOpen)}
          >
            {allPlans.filter(p => p.active).map(plan => (
              <div
                key={plan.id}
                onClick={() => {
                  setNewSub({ ...newSub, planId: plan.id, plan: plan.name });
                  setModalPlanOpen(false);
                }}
                className={`px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                  newSub.planId === plan.id ? 'bg-maroon/10' : 'hover:bg-surface2'
                }`}
              >
                <div className="text-ink text-sm font-medium">{plan.name}</div>
                <div className="text-subtle text-xs mt-0.5">
                  {plan.durationDays} days · {plan.price} {plan.currency} ·{' '}
                  <span className="text-amber-400 font-medium">{plan.credits} credits</span>
                </div>
              </div>
            ))}
          </SelectDropdown>

          {createSubMutation.isError ? (
            <div className="mb-4">
              <ErrorAlert>{createSubMutation.error?.response?.data?.message || "Failed to create"}</ErrorAlert>
            </div>
          ) : null}

          <Button
            type="submit"
            variant="primary"
            className="w-full justify-center"
            disabled={createSubMutation.isPending || !newSub.plan || !newSub.deviceId}
          >
            {createSubMutation.isPending ? "Creating..." : "Create subscription"}
          </Button>
        </form>
      </Modal>

      <ConfirmModal
        show={confirmState.show}
        onHide={() => setConfirmState({ show: false, subId: null })}
        onConfirm={executeDelete}
        title="Delete subscription?"
        message="Are you sure you want to delete this subscription? This action is permanent and the user will lose access immediately."
        confirmText="Delete"
        variant="danger"
        isLoading={deleteSubMutation.isPending}
      />
    </div>
  );
};

export default Subscriptions;