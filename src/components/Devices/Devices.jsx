import React, { useState, useCallback } from 'react';
import { FiActivity, FiShield, FiTrash2 } from 'react-icons/fi';
import { useDevices, useUpdateDeviceStatus, useDeleteDevice } from '../../hooks/useDevices';
import { useAuthContext } from '../../contexts/AuthContext';
import ColumnFilter from '../common/ColumnFilter';
import Sidebar from '../Shared/Sidebar';
import ConfirmModal from '../common/ConfirmModal';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import IconButton from '../common/IconButton';
import Spinner from '../common/Spinner';
import ErrorAlert from '../common/ErrorAlert';
import HamburgerIcon from '../common/HamburgerIcon';
import ProfileMenu from '../common/ProfileMenu';

const Devices = () => {
  const { user } = useAuthContext();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [page, setPage] = useState(0);
  const size = 20;

  const [filters, setFilters] = useState({
    deviceId: '',
    status: '',
    subscription: '',
    model: '',
    platform: ''
  });

  const activeFilters = {
    ...(filters.deviceId ? { deviceId: filters.deviceId } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.subscription ? { subscription: filters.subscription } : {}),
    ...(filters.model ? { model: filters.model } : {}),
    ...(filters.platform ? { platform: filters.platform } : {}),
  };

  const { data: devicesData, isLoading, error } = useDevices(page, size, activeFilters);
  const updateStatusMutation = useUpdateDeviceStatus();
  const deleteDeviceMutation = useDeleteDevice();

  const [confirmState, setConfirmState] = useState({ show: false, device: null });
  const [deleteConfirmState, setDeleteConfirmState] = useState({ show: false, device: null });

  const handleFilterChange = useCallback((column, value) => {
    setFilters(prev => ({ ...prev, [column]: value }));
    setPage(0);
  }, []);

  const devices = devicesData?.content || [];

  const handleStatusToggle = (deviceId, currentStatus) => {
    const device = devices.find(d => (d.deviceId || d.id) === deviceId);
    setConfirmState({ show: true, device: { ...device, deviceId, currentStatus } });
  };

  const executeStatusToggle = () => {
    const { device } = confirmState;
    if (device) {
      const newStatus = device.currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      updateStatusMutation.mutate(
        { deviceId: device.deviceId, status: newStatus },
        { onSuccess: () => setConfirmState({ show: false, device: null }) }
      );
    }
  };

  const handleDeleteClick = (device) => {
    setDeleteConfirmState({ show: true, device });
  };

  const executeDeleteDevice = () => {
    const { device } = deleteConfirmState;
    if (device) {
      deleteDeviceMutation.mutate(device.deviceId || device.id, {
        onSuccess: () => setDeleteConfirmState({ show: false, device: null })
      });
    }
  };

  const gridCols = 'grid-cols-[minmax(160px,2fr)_100px_120px_140px_120px_100px_130px_100px]';

  return (
    <div className="flex min-h-screen bg-base">
      <Sidebar
        activePage="devices"
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
                Manage <span className="text-maroon-light">Devices</span>
              </h1>
              <p className="hidden sm:block text-subtle text-sm mt-0.5">View and manage registered user devices</p>
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

          <Card noPadding>
            <div className="flex items-center justify-between px-4 md:px-5 py-4 border-b border-line">
              <h2 className="font-display font-semibold text-sm md:text-base text-ink">Device list</h2>
              <span className="text-[11px] font-mono text-subtle bg-surface2 border border-line rounded-full px-3 py-1.5">
                {devicesData?.totalElements ?? 0} devices
              </span>
            </div>

            <div className="overflow-x-auto">
              <div className={`grid ${gridCols} gap-3 px-4 md:px-5 py-3 min-w-[980px] border-b border-line`}>
                <div className="flex items-center gap-1 text-subtle text-xs font-medium uppercase tracking-wide">
                  Mac address <ColumnFilter column="deviceId" onFilterChange={handleFilterChange} placeholder="ID" />
                </div>
                <div className="flex items-center gap-1 justify-center text-subtle text-xs font-medium uppercase tracking-wide">
                  Status
                  <ColumnFilter
                    column="status"
                    onFilterChange={handleFilterChange}
                    placeholder="Status"
                    options={[{ label: 'Active', value: 'ACTIVE' }, { label: 'Inactive', value: 'INACTIVE' }]}
                  />
                </div>
                <div className="flex items-center gap-1 text-subtle text-xs font-medium uppercase tracking-wide">
                  Subs <ColumnFilter column="subscription" onFilterChange={handleFilterChange} placeholder="Subscription" />
                </div>
                <div className="flex items-center gap-1 text-subtle text-xs font-medium uppercase tracking-wide">
                  Model <ColumnFilter column="model" onFilterChange={handleFilterChange} placeholder="Model" />
                </div>
                <div className="text-subtle text-xs font-medium uppercase tracking-wide">OS version</div>
                <div className="flex items-center gap-1 text-subtle text-xs font-medium uppercase tracking-wide">
                  Platform <ColumnFilter column="platform" onFilterChange={handleFilterChange} placeholder="Platform" />
                </div>
                <div className="text-subtle text-xs font-medium uppercase tracking-wide">Registered</div>
                <div className="text-subtle text-xs font-medium uppercase tracking-wide text-center">Action</div>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-10"><Spinner /></div>
              ) : error ? (
                <div className="p-4"><ErrorAlert>Error loading devices: {error.message}</ErrorAlert></div>
              ) : devices.length === 0 ? (
                <div className="p-8 text-center text-subtle text-sm">No matching devices found.</div>
              ) : (
                devices.map((device) => {
                  const status = device.deviceStatus || device.status;
                  const isActive = status === 'ACTIVE';
                  return (
                    <div
                      key={device.deviceId}
                      className={`grid ${gridCols} gap-3 items-center px-4 md:px-5 py-3.5 min-w-[980px] border-b border-line last:border-b-0 hover:bg-surface2/60 transition-colors`}
                    >
                      <div className="font-medium text-ink text-sm truncate" title={device.macAddress}>
                        {device.macAddress || <span className="text-subtle italic">N/A</span>}
                      </div>
                      <div className="flex justify-center">
                        <Badge status={status || 'inactive'}>{status}</Badge>
                      </div>
                      <div className="text-subtle text-sm truncate">{device.subscriptionType}</div>
                      <div className="text-subtle text-sm truncate">{device.deviceModel}</div>
                      <div className="text-subtle text-sm truncate">{device.osVersion}</div>
                      <div className="text-subtle text-sm truncate">{device.platform}</div>
                      <div className="text-subtle text-sm truncate">
                        {device.registeredAt ? new Date(device.registeredAt).toLocaleDateString() : 'N/A'}
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <IconButton
                          icon={<FiShield />}
                          variant={isActive ? 'danger' : 'success'}
                          disabled={updateStatusMutation.isPending}
                          onClick={() => handleStatusToggle(device.deviceId || device.id, status)}
                          title={isActive ? 'Deactivate' : 'Activate'}
                        />
                        <IconButton
                          icon={<FiTrash2 />}
                          variant="danger"
                          disabled={deleteDeviceMutation.isPending}
                          onClick={() => handleDeleteClick(device)}
                          title="Delete device"
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>

          {devicesData && devicesData.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <Button
                variant="secondary"
                disabled={devicesData.first}
                onClick={() => setPage(p => Math.max(0, p - 1))}
              >
                Previous
              </Button>
              <span className="text-subtle text-sm">Page {page + 1} of {devicesData.totalPages}</span>
              <Button
                variant="secondary"
                disabled={devicesData.last}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </main>
      </div>

      <ConfirmModal
        show={confirmState.show}
        onHide={() => setConfirmState({ show: false, device: null })}
        onConfirm={executeStatusToggle}
        title={confirmState.device?.currentStatus === 'ACTIVE' ? 'Deactivate device?' : 'Activate device?'}
        message={`Are you sure you want to ${confirmState.device?.currentStatus === 'ACTIVE' ? 'deactivate' : 'activate'} this device? This will affect its connectivity to the platform.`}
        confirmText={confirmState.device?.currentStatus === 'ACTIVE' ? 'Deactivate' : 'Activate'}
        variant={confirmState.device?.currentStatus === 'ACTIVE' ? 'danger' : 'info'}
        isLoading={updateStatusMutation.isPending}
      />

      <ConfirmModal
        show={deleteConfirmState.show}
        onHide={() => setDeleteConfirmState({ show: false, device: null })}
        onConfirm={executeDeleteDevice}
        title="Permanently delete device?"
        message="Are you sure you want to completely delete this device? This action is permanent and will instantly remove all associated subscriptions, payments, activation requests, and playlists. This cannot be undone."
        confirmText="Delete completely"
        variant="danger"
        isLoading={deleteDeviceMutation.isPending}
      />
    </div>
  );
};

export default Devices;