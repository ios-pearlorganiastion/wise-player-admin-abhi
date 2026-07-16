import React, { useState, useMemo } from 'react';
import { FiTag, FiPlus, FiEdit2, FiPower, FiActivity, FiPackage } from 'react-icons/fi';
import Sidebar from '../Shared/Sidebar';
import { usePlans, useCreatePlan, useUpdatePlan, useTogglePlanStatus } from '../../hooks/usePlans';
import { useAuthContext } from '../../contexts/AuthContext';
import ColumnFilter from '../common/ColumnFilter';
import Pagination from '../common/Pagination';
import ConfirmModal from '../common/ConfirmModal';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import IconButton from '../common/IconButton';
import Spinner from '../common/Spinner';
import ErrorAlert from '../common/ErrorAlert';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import HamburgerIcon from '../common/HamburgerIcon';
import ProfileMenu from '../common/ProfileMenu';

const Plans = () => {
  const { user } = useAuthContext();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [page, setPage] = useState(0);
  const size = 20;
  const [planFilter, setPlanFilter] = useState('');

  const { data: plansData, isLoading, error } = usePlans(page, size);

  const filteredPlans = useMemo(() => {
    if (!plansData?.content) return [];
    return plansData.content.filter(plan =>
      !planFilter || plan.name?.toLowerCase().includes(planFilter.toLowerCase())
    );
  }, [plansData, planFilter]);

  const createMutation = useCreatePlan();
  const updateMutation = useUpdatePlan();
  const toggleStatusMutation = useTogglePlanStatus();

  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    durationDays: '',
    price: '',
    credits: '',
    currency: 'EUR',
    description: ''
  });

  const [confirmState, setConfirmState] = useState({ show: false, plan: null });

  const handleOpenModal = (plan = null) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        durationDays: plan.durationDays,
        price: plan.price,
        credits: plan.credits || '',
        currency: plan.currency || 'EUR',
        description: plan.description || ''
      });
    } else {
      setEditingPlan(null);
      setFormData({
        name: '',
        durationDays: '',
        price: '',
        credits: '',
        currency: 'EUR',
        description: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      durationDays: parseInt(formData.durationDays),
      price: parseFloat(formData.price),
      credits: parseFloat(formData.credits)
    };

    if (editingPlan) {
      updateMutation.mutate({ id: editingPlan.id, plan: payload }, {
        onSuccess: () => setShowModal(false)
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => setShowModal(false)
      });
    }
  };

  const handleToggleStatus = (plan) => {
    setConfirmState({ show: true, plan });
  };

  const executeToggleStatus = () => {
    const { plan } = confirmState;
    if (plan) {
      toggleStatusMutation.mutate(plan.id, {
        onSuccess: () => setConfirmState({ show: false, plan: null })
      });
    }
  };

  const gridCols = 'grid-cols-[70px_minmax(180px,2fr)_100px_110px_100px_110px_120px]';
  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex min-h-screen bg-base">
      <Sidebar
        activePage="plans"
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
                Subscription <span className="text-maroon-light">Plans</span>
              </h1>
              <p className="hidden sm:block text-subtle text-sm mt-0.5">Define and manage your service offerings</p>
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

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiPackage className="text-maroon-light text-lg" />
              <h2 className="font-display font-semibold text-lg text-ink">Available plans</h2>
            </div>
            <Button variant="primary" onClick={() => handleOpenModal()} className="gap-2">
              <FiPlus /> Create new plan
            </Button>
          </div>

          <Card noPadding>
            {isLoading ? (
              <div className="flex justify-center py-10"><Spinner /></div>
            ) : error ? (
              <div className="p-4"><ErrorAlert>Error loading plans: {error.message}</ErrorAlert></div>
            ) : (
              <div className="overflow-x-auto">
                <div className={`grid ${gridCols} gap-3 px-4 md:px-5 py-3 min-w-[900px] border-b border-line`}>
                  <div className="text-subtle text-xs font-medium uppercase tracking-wide">Id</div>
                  <div className="flex items-center gap-1 text-subtle text-xs font-medium uppercase tracking-wide">
                    Plan name <ColumnFilter column="plan" onFilterChange={(_, val) => setPlanFilter(val)} placeholder="Plan name" />
                  </div>
                  <div className="text-subtle text-xs font-medium uppercase tracking-wide text-right">Duration</div>
                  <div className="text-subtle text-xs font-medium uppercase tracking-wide text-right">Price</div>
                  <div className="text-subtle text-xs font-medium uppercase tracking-wide text-right">Credits</div>
                  <div className="text-subtle text-xs font-medium uppercase tracking-wide text-center">Status</div>
                  <div className="text-subtle text-xs font-medium uppercase tracking-wide text-center">Actions</div>
                </div>

                {filteredPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`grid ${gridCols} gap-3 items-center px-4 md:px-5 py-3.5 min-w-[900px] border-b border-line last:border-b-0 hover:bg-surface2/60 transition-colors`}
                  >
                    <div className="font-mono text-subtle text-xs">#{plan.id}</div>
                    <div className="flex items-center gap-2 font-medium text-ink text-sm truncate">
                      <FiTag className="text-maroon-light shrink-0" /> {plan.name}
                    </div>
                    <div className="text-subtle text-sm text-right">{plan.durationDays} days</div>
                    <div className="text-sm text-right">
                      <span className="text-sky-400 font-medium">{plan.price}</span> <span className="text-subtle">{plan.currency}</span>
                    </div>
                    <div className="text-sm text-right">
                      <span className="text-amber-400 font-medium">{plan.credits}</span>
                    </div>
                    <div className="flex justify-center">
                      <Badge status={plan.active ? 'active' : 'inactive'}>{plan.active ? 'Active' : 'Inactive'}</Badge>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <IconButton icon={<FiEdit2 />} title="Edit" onClick={() => handleOpenModal(plan)} />
                      <IconButton
                        icon={<FiPower />}
                        variant={plan.active ? 'danger' : 'success'}
                        disabled={toggleStatusMutation.isPending}
                        onClick={() => handleToggleStatus(plan)}
                        title={plan.active ? 'Disable' : 'Enable'}
                      />
                    </div>
                  </div>
                ))}

                {filteredPlans.length === 0 ? (
                  <div className="p-10 text-center text-subtle text-sm">No matching plans found.</div>
                ) : null}
              </div>
            )}

            <div className="px-4 md:px-5 py-4 border-t border-line">
              <Pagination
                currentPage={page}
                totalPages={plansData?.totalPages || 0}
                onPageChange={setPage}
              />
            </div>
          </Card>
        </main>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} title={editingPlan ? 'Edit plan' : 'Create new plan'}>
        <form onSubmit={handleSubmit}>
          <Input
            label="Plan name"
            type="text"
            required
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Annual subscription"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Duration (days)"
              type="number"
              required
              value={formData.durationDays}
              onChange={e => setFormData({ ...formData, durationDays: e.target.value })}
              placeholder="e.g. 365"
            />
            <div className="mb-4">
              <label className="block text-subtle text-xs font-medium mb-1.5">Price</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                  placeholder="59.99"
                  className="flex-1 min-w-0 bg-surface2 border border-line rounded-lg px-3 h-10 text-sm text-ink outline-none focus:border-maroon-light transition-colors placeholder:text-subtle"
                />
                <select
                  value={formData.currency}
                  onChange={e => setFormData({ ...formData, currency: e.target.value })}
                  className="bg-surface2 border border-line rounded-lg px-2 h-10 text-sm text-ink outline-none focus:border-maroon-light transition-colors w-24 [&>option]:bg-surface"
                >
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>
          </div>

          <Input
            label="Credit cost (for resellers)"
            type="number"
            step="0.01"
            required
            value={formData.credits}
            onChange={e => setFormData({ ...formData, credits: e.target.value })}
            placeholder="e.g. 30.00"
          />

          <Textarea
            label="Description"
            rows={3}
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            placeholder="Briefly describe what this plan offers..."
          />

          <Button type="submit" variant="primary" className="w-full justify-center mt-2" disabled={isSaving}>
            {isSaving ? 'Saving...' : editingPlan ? 'Update plan' : 'Create plan'}
          </Button>
        </form>
      </Modal>

      <ConfirmModal
        show={confirmState.show}
        onHide={() => setConfirmState({ show: false, plan: null })}
        onConfirm={executeToggleStatus}
        title={confirmState.plan?.active ? 'Deactivate plan?' : 'Activate plan?'}
        message={`Are you sure you want to ${confirmState.plan?.active ? 'deactivate' : 'activate'} this subscription plan? Existing subscriptions will remain valid until expiry.`}
        confirmText={confirmState.plan?.active ? 'Deactivate' : 'Activate'}
        variant={confirmState.plan?.active ? 'danger' : 'info'}
        isLoading={toggleStatusMutation.isPending}
      />
    </div>
  );
};

export default Plans;