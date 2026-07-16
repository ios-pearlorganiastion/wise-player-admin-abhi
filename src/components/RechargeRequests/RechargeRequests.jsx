import React, { useState, useEffect } from 'react';
import { FiCheck, FiX, FiActivity, FiMessageSquare } from 'react-icons/fi';
import { useActivationRequests, useApproveActivation, useRejectActivation } from '../../hooks/useActivationRequests';
import { useAuthContext } from '../../contexts/AuthContext';
import ColumnFilter from '../common/ColumnFilter';
import Pagination from '../common/Pagination';
import Sidebar from '../Shared/Sidebar';
import Card from '../common/Card';
import Badge from '../common/Badge';
import IconButton from '../common/IconButton';
import Spinner from '../common/Spinner';
import ErrorAlert from '../common/ErrorAlert';
import Modal from '../common/Modal';
import Textarea from '../common/Textarea';
import Button from '../common/Button';
import HamburgerIcon from '../common/HamburgerIcon';
import ProfileMenu from '../common/ProfileMenu';

const ActivationRequests = () => {
  const { user } = useAuthContext();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [page, setPage] = useState(0);
  const size = 20;
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [deviceFilter, setDeviceFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');

  const activeFilters = {
    ...(deviceFilter ? { deviceId: deviceFilter } : {}),
    ...(planFilter ? { planName: planFilter } : {}),
  };

  const { data: requestsData, isLoading, error } = useActivationRequests(statusFilter, page, size, activeFilters);
  const requests = requestsData?.content || [];

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(0);
  }, [deviceFilter, planFilter, statusFilter]);

  const approveMutation = useApproveActivation();
  const rejectMutation = useRejectActivation();

  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionType, setActionType] = useState('APPROVE');
  const [actionError, setActionError] = useState('');

  const handleOpenModal = (request, type) => {
    setSelectedRequest(request);
    setActionType(type);
    setAdminNotes('');
    setActionError('');
    setShowModal(true);
  };

  const handleAction = (e) => {
    e.preventDefault();
    setActionError('');
    const mutation = actionType === 'APPROVE' ? approveMutation : rejectMutation;
    mutation.mutate({ id: selectedRequest.id, adminNotes }, {
      onSuccess: () => setShowModal(false),
      onError: (err) => {
        setActionError(err.response?.data?.message || err.message || 'An error occurred during the action.');
      }
    });
  };

  const gridCols = 'grid-cols-[70px_minmax(150px,1.8fr)_130px_110px_110px_110px_130px]';
  const modalTitle = actionType === 'APPROVE' ? 'Approve request' : actionType === 'REJECT' ? 'Reject request' : 'Request details';

  return (
    <div className="flex min-h-screen bg-base">
      <Sidebar
        activePage="activation-requests"
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
                Activation <span className="text-maroon-light">Requests</span>
              </h1>
              <p className="hidden sm:block text-subtle text-sm mt-0.5">Approve or reject manual activation and renewal requests</p>
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

          <div className="flex gap-2">
            {['PENDING', 'APPROVED', 'REJECTED'].map(status => (
              <button
                key={status}
                onClick={() => { setStatusFilter(status); setPage(0); }}
                className={`text-sm font-medium rounded-lg px-4 py-2 transition-colors ${
                  statusFilter === status
                    ? 'bg-maroon text-ink'
                    : 'text-subtle border border-line hover:text-ink hover:border-line'
                }`}
              >
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <Card noPadding>
            <div className="px-4 md:px-5 py-4 border-b border-line">
              <h2 className="font-display font-semibold text-sm md:text-base text-ink">
                {statusFilter.charAt(0) + statusFilter.slice(1).toLowerCase()} requests
              </h2>
            </div>

            <div className="overflow-x-auto">
              <div className={`grid ${gridCols} gap-3 px-4 md:px-5 py-3 min-w-[900px] border-b border-line`}>
                <div className="text-subtle text-xs font-medium uppercase tracking-wide">Id</div>
                <div className="flex items-center gap-1 text-subtle text-xs font-medium uppercase tracking-wide">
                  Mac address <ColumnFilter column="device" onFilterChange={(_, val) => setDeviceFilter(val)} placeholder="MAC/ID" />
                </div>
                <div className="flex items-center gap-1 text-subtle text-xs font-medium uppercase tracking-wide">
                  Plan <ColumnFilter column="plan" onFilterChange={(_, val) => setPlanFilter(val)} placeholder="Plan" />
                </div>
                <div className="text-subtle text-xs font-medium uppercase tracking-wide text-right">Amount</div>
                <div className="text-subtle text-xs font-medium uppercase tracking-wide text-center">Status</div>
                <div className="text-subtle text-xs font-medium uppercase tracking-wide">Date</div>
                <div className="text-subtle text-xs font-medium uppercase tracking-wide text-center">Actions</div>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-10"><Spinner /></div>
              ) : error ? (
                <div className="p-4"><ErrorAlert>Error loading requests: {error.message}</ErrorAlert></div>
              ) : requests.length === 0 ? (
                <div className="p-8 text-center text-subtle text-sm">
                  No {statusFilter.toLowerCase()} requests found.
                </div>
              ) : (
                requests.map((req) => (
                  <div
                    key={req.id}
                    className={`grid ${gridCols} gap-3 items-center px-4 md:px-5 py-3.5 min-w-[900px] border-b border-line last:border-b-0 hover:bg-surface2/60 transition-colors`}
                  >
                    <div className="font-mono text-subtle text-xs">#{req.id}</div>
                    <div className="font-medium text-ink text-sm truncate" title={req.macAddress}>
                      {req.macAddress || <span className="text-subtle italic">N/A</span>}
                    </div>
                    <div className="text-ink text-sm truncate">{req.planName}</div>
                    <div className="font-mono font-semibold text-emerald-400 text-sm text-right">{req.amount} {req.currency}</div>
                    <div className="flex justify-center">
                      <Badge status={req.status}>{req.status}</Badge>
                    </div>
                    <div className="text-subtle text-sm">{new Date(req.createdAt).toLocaleDateString()}</div>
                    <div className="flex items-center justify-center gap-2">
                      {req.status === 'PENDING' ? (
                        <>
                          <IconButton icon={<FiCheck />} variant="success" title="Approve" onClick={() => handleOpenModal(req, 'APPROVE')} />
                          <IconButton icon={<FiX />} variant="danger" title="Reject" onClick={() => handleOpenModal(req, 'REJECT')} />
                        </>
                      ) : (
                        <button
                          onClick={() => handleOpenModal(req, 'VIEW')}
                          className="flex items-center gap-1.5 text-xs font-medium text-sky-400 hover:text-sky-300 transition-colors"
                        >
                          {req.adminNotes ? <><FiMessageSquare className="text-[11px]" /> View notes</> : <span className="text-subtle">No notes</span>}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="px-4 md:px-5 py-4 border-t border-line">
              <Pagination
                currentPage={page}
                totalPages={requestsData?.totalPages || 0}
                onPageChange={setPage}
              />
            </div>
          </Card>
        </main>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} title={modalTitle}>
        {actionError ? <div className="mb-4"><ErrorAlert>{actionError}</ErrorAlert></div> : null}

        <form onSubmit={handleAction}>
          <div className="bg-surface2 border border-line rounded-lg p-3.5 mb-4 space-y-1.5 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-subtle">Mac address</span>
              <span className="text-ink font-medium">{selectedRequest?.macAddress || 'N/A'}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-subtle">Device ID</span>
              <span className="text-ink font-mono text-xs">{selectedRequest?.deviceId}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-subtle">Plan</span>
              <span className="text-ink font-medium">{selectedRequest?.planName}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-subtle">Amount</span>
              <span className="text-ink font-medium">{selectedRequest?.amount} {selectedRequest?.currency}</span>
            </div>
            <div className="flex justify-between items-center gap-3 pt-1">
              <span className="text-subtle">Status</span>
              {selectedRequest ? <Badge status={selectedRequest.status}>{selectedRequest.status}</Badge> : null}
            </div>
          </div>

          <Textarea
            label="Admin notes"
            rows={3}
            required={actionType === 'REJECT'}
            readOnly={actionType === 'VIEW'}
            value={actionType === 'VIEW' ? (selectedRequest?.adminNotes || 'No notes provided.') : adminNotes}
            onChange={e => setAdminNotes(e.target.value)}
            placeholder={actionType === 'APPROVE' ? "Optional notes about approval..." : "Reason for rejection (required)..."}
          />

          {actionType !== 'VIEW' ? (
            <Button
              type="submit"
              variant={actionType === 'APPROVE' ? 'primary' : 'primary'}
              className={`w-full justify-center mt-2 ${actionType === 'REJECT' ? '' : '!bg-emerald-600 hover:!bg-emerald-500'}`}
              disabled={approveMutation.isPending || rejectMutation.isPending}
            >
              {actionType === 'APPROVE' ? 'Approve' : 'Reject'}
            </Button>
          ) : null}
        </form>
      </Modal>
    </div>
  );
};

export default ActivationRequests;