import React, { useState } from 'react';
import { Modal, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiLayers, FiTrendingUp, FiMenu } from 'react-icons/fi';
import { usePricingTiers, useCreatePricingTier, useUpdatePricingTier } from '../../hooks/usePricingTiers';
import Sidebar from '../Shared/Sidebar';
import './PricingTiers.css';

const PricingTiers = () => {
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

  return (
    <div className="dashboard-container">
      <Sidebar activePage="pricing-tiers" isMobileOpen={isMobileOpen} onMobileClose={() => setIsMobileOpen(false)} />

      <div className="content-area">
        <header className="dash-header">
          <div className="header-left-group">
            <button className="mobile-toggle-btn" onClick={() => setIsMobileOpen(true)}>
              <FiMenu />
            </button>
            <div className="welcome-text">
              <h1>
                Pricing <span className="highlight">Tiers</span>
              </h1>
              <p>Volume-based unit pricing for devices and subscriptions</p>
            </div>
          </div>
        </header>

        <div className="d-flex justify-content-between align-items-center mt-4 mb-4">
          <h3 className="section-title m-0">Active Tiers</h3>
          <button className="pt-add-btn" onClick={() => openModal()}>
            <FiPlus /> Add Tier
          </button>
        </div>

        {isLoading ? (
          <div className="text-center my-5">
            <Spinner animation="border" style={{ color: 'var(--accent-cyan)' }} />
          </div>
        ) : error ? (
          <Alert variant="danger" className="m-0">Error loading pricing tiers: {error.message}</Alert>
        ) : (
          <div
  className="custom-table-wrapper"
  style={{ overflowX: 'auto', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', background: 'var(--glass-bg)' }}
>
            <div className="pt-header-row">
              <div>Tier Name</div>
              <div className="text-center">Min Qty</div>
              <div className="text-center">Max Qty</div>
              <div className="text-center">Unit Price</div>
              <div>Created</div>
              <div>Updated</div>
              <div className="text-center">Action</div>
            </div>

            {tiers?.map((tier, index) => (
              <div
                key={tier.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="pt-row"
              >
                <div className="pt-name-cell">
                  <div className="pt-icon-box">
                    <FiLayers size={14} />
                  </div>
                  {tier.name}
                </div>
                <div className="pt-cell-center">{tier.minQuantity}</div>
                <div className="pt-cell-center">
                  {tier.maxQuantity === null ? (
                    <span className="pt-unlimited-badge">
                      <FiTrendingUp size={11} /> Unlimited
                    </span>
                  ) : (
                    tier.maxQuantity
                  )}
                </div>
                <div className="pt-price">${tier.unitPrice.toFixed(2)}</div>
                <div className="pt-muted">{tier.createdAt ? new Date(tier.createdAt).toLocaleDateString() : '—'}</div>
                <div className="pt-muted">{tier.updatedAt ? new Date(tier.updatedAt).toLocaleDateString() : '—'}</div>
                <div className="text-center">
                  <button className="pt-edit-btn" onClick={() => openModal(tier)}>
                    <FiEdit2 size={14} />
                  </button>
                </div>
              </div>
            ))}

            {tiers?.length === 0 && <div className="pt-empty-state">No pricing tiers configured yet.</div>}
          </div>
        )}
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered className="dark-modal">
        <Modal.Header closeButton className="bg-dark text-white border-secondary">
          <Modal.Title>{editingTier ? 'Edit Pricing Tier' : 'Add Pricing Tier'}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-white p-4">
          <AnimatePresence>
            {formError && (
              <div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <Alert variant="danger" className="mb-3">{formError}</Alert>
              </div>
            )}
          </AnimatePresence>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="text-white-50 small">Tier Name</Form.Label>
              <Form.Control
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. WHOLESALE"
                className="bg-secondary text-white border-0"
              />
            </Form.Group>

            <div className="form-group-responsive mb-3">
              <Form.Group>
                <Form.Label className="text-white-50 small">Min Quantity</Form.Label>
                <Form.Control
                  type="number"
                  required
                  min={0}
                  value={formData.minQuantity}
                  onChange={(e) => setFormData({ ...formData, minQuantity: e.target.value })}
                  className="bg-secondary text-white border-0"
                />
              </Form.Group>
              <Form.Group>
                <Form.Label className="text-white-50 small">Max Quantity</Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  value={formData.maxQuantity}
                  onChange={(e) => setFormData({ ...formData, maxQuantity: e.target.value })}
                  placeholder="Blank = unlimited"
                  className="bg-secondary text-white border-0"
                />
                <Form.Text style={{ color: 'var(--text-muted)' }}>Leave blank for no upper limit.</Form.Text>
              </Form.Group>
            </div>

            <Form.Group className="mb-4">
              <Form.Label className="text-white-50 small">Unit Price ($)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                min={0}
                required
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                className="bg-secondary text-white border-0"
              />
            </Form.Group>

            <Button
              type="submit"
              disabled={isSaving}
              className="w-100 py-2 fw-bold fs-5 border-0"
              style={{ background: 'var(--grad-primary)', color: '#000', boxShadow: 'var(--glow-cyan)' }}
            >
              {isSaving ? <Spinner animation="border" size="sm" /> : editingTier ? 'Update Tier' : 'Create Tier'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default PricingTiers;