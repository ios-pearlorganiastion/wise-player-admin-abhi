import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiLayers, FiTrendingUp, FiActivity } from 'react-icons/fi';
import { usePricingTiers, useCreatePricingTier, useUpdatePricingTier } from '../../hooks/usePricingTiers';
import { useAuthContext } from '../../contexts/AuthContext';
import Sidebar from '../Shared/Sidebar';
import Card from '../common/Card';
import Button from '../common/Button';
import IconButton from '../common/IconButton';
import Spinner from '../common/Spinner';
import ErrorAlert from '../common/ErrorAlert';
import Modal from '../common/Modal';
import Input from '../common/Input';
import HamburgerIcon from '../common/HamburgerIcon';
import ProfileMenu from '../common/ProfileMenu';

const PricingTiers = () => {
  const { user } = useAuthContext();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { data: tiers, isLoading, error } = usePricingTiers();
  const createMutation = useCreatePricingTier();
  const updateMutation = useUpdatePricingTier();

  const [showModal, setShowModal] = useState(false);
  const [editingTier, setEditingTier] = useState(null);
  const [formData, setFormData] = useState({ name: '', minQuantity: '', maxQuantity: '', unitPrice: '' });
  const [formError, setFormError] = useState('');

  const openModal = (tier = null) => {
    setFormError('');
    if (tier) {
      setEditingTier(tier);
      setFormData({
        name: tier.name,
        minQuantity: tier.minQuantity,
        maxQuantity: tier.maxQuantity === null ? '' : tier.maxQuantity,
        unitPrice: tier.unitPrice,
      });
    } else {
      setEditingTier(null);
      setFormData({ name: '', minQuantity: '', maxQuantity: '', unitPrice: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    const payload = {
      name: formData.name.trim(),
      minQuantity: Number(formData.minQuantity),
      maxQuantity: formData.maxQuantity === '' ? null : Number(formData.maxQuantity),
      unitPrice: Number(formData.unitPrice),
    };

    if (payload.maxQuantity !== null && payload.maxQuantity < payload.minQuantity) {
      setFormError('Max quantity cannot be less than min quantity.');
      return;
    }

    const mutation = editingTier
      ? updateMutation.mutateAsync({ id: editingTier.id, tier: payload })
      : createMutation.mutateAsync(payload);

    mutation
      .then(() => setShowModal(false))
      .catch((err) => setFormError(err?.response?.data?.message || 'Something went wrong. Please try again.'));
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const gridCols = 'grid-cols-[minmax(160px,2fr)_100px_120px_110px_110px_110px_90px]';

  return (
    <div className="flex min-h-screen bg-base">
      <Sidebar activePage="pricing-tiers" isMobileOpen={isMobileOpen} onMobileClose={() => setIsMobileOpen(false)} />

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
                Pricing <span className="text-maroon-light">Tiers</span>
              </h1>
              <p className="hidden sm:block text-subtle text-sm mt-0.5">Volume-based unit pricing for devices and subscriptions</p>
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
            <h2 className="font-display font-semibold text-lg text-ink">Active tiers</h2>
            <Button variant="primary" onClick={() => openModal()} className="gap-2">
              <FiPlus /> Add tier
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : error ? (
            <ErrorAlert>Error loading pricing tiers: {error.message}</ErrorAlert>
          ) : (
            <Card noPadding>
              <div className="overflow-x-auto">
                <div className={`grid ${gridCols} gap-3 px-4 md:px-5 py-3 min-w-[820px] border-b border-line`}>
                  <div className="text-subtle text-xs font-medium uppercase tracking-wide">Tier name</div>
                  <div className="text-subtle text-xs font-medium uppercase tracking-wide text-center">Min qty</div>
                  <div className="text-subtle text-xs font-medium uppercase tracking-wide text-center">Max qty</div>
                  <div className="text-subtle text-xs font-medium uppercase tracking-wide text-center">Unit price</div>
                  <div className="text-subtle text-xs font-medium uppercase tracking-wide">Created</div>
                  <div className="text-subtle text-xs font-medium uppercase tracking-wide">Updated</div>
                  <div className="text-subtle text-xs font-medium uppercase tracking-wide text-center">Action</div>
                </div>

                {tiers?.map((tier) => (
                  <div
                    key={tier.id}
                    className={`grid ${gridCols} gap-3 items-center px-4 md:px-5 py-3.5 min-w-[820px] border-b border-line last:border-b-0 hover:bg-surface2/60 transition-colors`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-maroon/15 text-maroon-light flex items-center justify-center shrink-0">
                        <FiLayers className="text-xs" />
                      </div>
                      <span className="font-medium text-ink text-sm truncate">{tier.name}</span>
                    </div>
                    <div className="text-ink text-sm text-center">{tier.minQuantity}</div>
                    <div className="text-sm text-center">
                      {tier.maxQuantity === null ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 rounded-full px-2 py-1">
                          <FiTrendingUp className="text-[10px]" /> Unlimited
                        </span>
                      ) : (
                        <span className="text-ink">{tier.maxQuantity}</span>
                      )}
                    </div>
                    <div className="font-mono font-medium text-ink text-sm text-center">${tier.unitPrice.toFixed(2)}</div>
                    <div className="text-subtle text-sm">{tier.createdAt ? new Date(tier.createdAt).toLocaleDateString() : '—'}</div>
                    <div className="text-subtle text-sm">{tier.updatedAt ? new Date(tier.updatedAt).toLocaleDateString() : '—'}</div>
                    <div className="flex justify-center">
                      <IconButton icon={<FiEdit2 />} title="Edit" onClick={() => openModal(tier)} />
                    </div>
                  </div>
                ))}

                {tiers?.length === 0 ? (
                  <div className="p-10 text-center text-subtle text-sm">No pricing tiers configured yet.</div>
                ) : null}
              </div>
            </Card>
          )}
        </main>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} title={editingTier ? 'Edit pricing tier' : 'Add pricing tier'}>
        <AnimatePresence>
          {formError ? (
            <div className="mb-4"><ErrorAlert>{formError}</ErrorAlert></div>
          ) : null}
        </AnimatePresence>

        <form onSubmit={handleSubmit}>
          <Input
            label="Tier name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. WHOLESALE"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Min quantity"
              type="number"
              required
              min={0}
              value={formData.minQuantity}
              onChange={(e) => setFormData({ ...formData, minQuantity: e.target.value })}
            />
            <div>
              <Input
                label="Max quantity"
                type="number"
                min={0}
                value={formData.maxQuantity}
                onChange={(e) => setFormData({ ...formData, maxQuantity: e.target.value })}
                placeholder="Blank = unlimited"
              />
              <p className="text-subtle text-xs -mt-3 mb-4">Leave blank for no upper limit.</p>
            </div>
          </div>

          <Input
            label="Unit price ($)"
            type="number"
            step="0.01"
            min={0}
            required
            value={formData.unitPrice}
            onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
          />

          <Button type="submit" variant="primary" className="w-full justify-center mt-2" disabled={isSaving}>
            {isSaving ? 'Saving...' : editingTier ? 'Update tier' : 'Create tier'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default PricingTiers;