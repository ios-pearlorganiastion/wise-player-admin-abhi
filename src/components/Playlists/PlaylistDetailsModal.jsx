import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiServer, FiUser, FiLock, FiCpu, FiEye, FiEyeOff, FiTrash2, FiTv, FiLink, FiStar, FiEdit2, FiUserPlus, FiUserMinus } from 'react-icons/fi';
import { usePlaylist, useUpdatePlaylist, useAssignPlaylist, useUnassignPlaylist, useTogglePlaylistPin } from '../../hooks/usePlaylists';
import Spinner from '../common/Spinner';
import ErrorAlert from '../common/ErrorAlert';
import CopyButton from '../common/CopyButton';
import Button from '../common/Button';
import Input from '../common/Input';

const Field = ({ icon, label, value, mono = false, secret = false }) => {
  const [show, setShow] = useState(false);
  if (!value) return null;
  return (
    <div>
      <div className="flex items-center gap-1.5 text-subtle text-xs font-medium uppercase tracking-wide mb-1.5">
        {icon} {label}
      </div>
      <div className="flex items-center gap-2 bg-surface2 border border-line rounded-lg px-3 py-2.5">
        <span className={`flex-1 min-w-0 truncate text-ink text-sm ${mono ? 'font-mono' : ''}`}>
          {secret && !show ? '••••••••' : value}
        </span>
        {secret ? (
          <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide' : 'Show'} className="text-subtle hover:text-ink transition-colors shrink-0">
            {show ? <FiEyeOff className="text-xs" /> : <FiEye className="text-xs" />}
          </button>
        ) : null}
        <CopyButton value={value} />
      </div>
    </div>
  );
};

const PlaylistDetailsModal = ({ playlistId, fallback, onClose, onDelete, isDeleting }) => {
  const { data, isLoading, error } = usePlaylist(playlistId);
  const playlist = data || fallback;

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [editError, setEditError] = useState('');

  const [assignDeviceId, setAssignDeviceId] = useState('');
  const [assignError, setAssignError] = useState('');

  const updateMutation = useUpdatePlaylist();
  const assignMutation = useAssignPlaylist();
  const unassignMutation = useUnassignPlaylist();
  const pinMutation = useTogglePlaylistPin();

  if (!playlistId) return null;

  const startEdit = () => {
    setEditForm({
      name: playlist.name || '',
      serverUrl: playlist.serverUrl || '',
      username: playlist.username || '',
      password: playlist.password || '',
    });
    setEditError('');
    setIsEditing(true);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    setEditError('');
    updateMutation.mutate(
      { id: playlist.id, payload: editForm },
      {
        onSuccess: () => setIsEditing(false),
        onError: (err) => setEditError(err.response?.data?.message || 'Failed to update playlist.'),
      }
    );
  };

  const handleAssign = (e) => {
    e.preventDefault();
    setAssignError('');
    if (!assignDeviceId.trim()) return;
    assignMutation.mutate(
      { id: playlist.id, deviceId: assignDeviceId.trim() },
      {
        onSuccess: () => setAssignDeviceId(''),
        onError: (err) => setAssignError(err.response?.data?.message || 'Failed to assign device.'),
      }
    );
  };

  const handleUnassign = () => {
    unassignMutation.mutate(playlist.id);
  };

  const handleTogglePin = () => {
    pinMutation.mutate(playlist.id);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
        <div className="absolute inset-0 bg-black/60" />
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full sm:w-[420px] h-full bg-surface border-l border-line overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-surface flex items-start justify-between px-5 py-4 border-b border-line z-10">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-maroon/15 text-maroon-light flex items-center justify-center shrink-0">
                {playlist?.type === 'XTREAM' ? <FiTv className="text-sm" /> : <FiLink className="text-sm" />}
              </div>
              <div className="min-w-0">
                <h2 className="font-display font-semibold text-ink text-base truncate">{playlist?.name || 'Playlist'}</h2>
                <p className="text-subtle text-xs mt-0.5">ID: {playlistId}</p>
              </div>
            </div>
            <button onClick={onClose} aria-label="Close" className="w-8 h-8 flex items-center justify-center rounded-lg text-subtle hover:bg-surface2 hover:text-ink transition-colors shrink-0">
              <FiX />
            </button>
          </div>

          {isLoading && !playlist ? (
            <div className="flex justify-center py-16"><Spinner /></div>
          ) : error && !playlist ? (
            <div className="p-5"><ErrorAlert>Failed to load playlist: {error.message}</ErrorAlert></div>
          ) : playlist ? (
            <div className="p-5 space-y-5">

              <div className="flex items-center justify-between">
                <button
                  onClick={handleTogglePin}
                  disabled={pinMutation.isPending}
                  className={`flex items-center gap-1.5 text-xs font-medium rounded-full px-3 py-1.5 transition-colors disabled:opacity-50 ${
                    playlist.pinned ? 'bg-amber-500/10 text-amber-400' : 'text-subtle border border-line hover:text-ink'
                  }`}
                >
                  <FiStar className="text-[11px]" /> {playlist.pinned ? 'Pinned' : 'Pin playlist'}
                </button>

                {!isEditing ? (
                  <button
                    onClick={startEdit}
                    className="flex items-center gap-1.5 text-xs font-medium text-ink border border-line hover:border-maroon-light hover:text-maroon-light rounded-lg px-3 py-1.5 transition-colors"
                  >
                    <FiEdit2 className="text-[11px]" /> Edit
                  </button>
                ) : null}
              </div>

              {isEditing ? (
                <form onSubmit={handleUpdate} className="space-y-1">
                  {editError ? <div className="mb-3"><ErrorAlert>{editError}</ErrorAlert></div> : null}
                  <Input label="Name" type="text" required value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                  <Input label="Server URL" type="text" value={editForm.serverUrl} onChange={(e) => setEditForm({ ...editForm, serverUrl: e.target.value })} />
                  <Input label="Username" type="text" value={editForm.username} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} />
                  <Input label="Password" type="text" value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} />
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 text-sm font-medium text-subtle hover:text-ink border border-line rounded-lg py-2.5 transition-colors"
                    >
                      Cancel
                    </button>
                    <Button type="submit" variant="primary" className="flex-1 justify-center" disabled={updateMutation.isPending}>
                      {updateMutation.isPending ? 'Saving...' : 'Save changes'}
                    </Button>
                  </div>
                </form>
              ) : (
                <>
                  <Field icon={<FiCpu />} label="Device ID" value={playlist.deviceId} mono />
                  <Field icon={<FiTv />} label="Type" value={playlist.type} />
                  <Field icon={<FiServer />} label="Server URL" value={playlist.serverUrl} mono />
                  <Field icon={<FiLink />} label="M3U URL" value={playlist.m3uUrl} mono />
                  <Field icon={<FiUser />} label="Username" value={playlist.username} mono />
                  <Field icon={<FiLock />} label="Password" value={playlist.password} mono secret />
                </>
              )}

              <div className="pt-2 border-t border-line">
                <div className="flex items-center gap-1.5 text-subtle text-xs font-medium uppercase tracking-wide mb-2.5">
                  <FiUserPlus className="text-[11px]" /> Device assignment
                </div>

                {playlist.deviceId ? (
                  <Button
                    variant="secondary"
                    onClick={handleUnassign}
                    disabled={unassignMutation.isPending}
                    className="w-full justify-center gap-2"
                  >
                    <FiUserMinus /> {unassignMutation.isPending ? 'Unassigning...' : 'Unassign device'}
                  </Button>
                ) : (
                  <form onSubmit={handleAssign} className="flex gap-2">
                    <input
                      type="text"
                      value={assignDeviceId}
                      onChange={(e) => setAssignDeviceId(e.target.value)}
                      placeholder="Device ID"
                      className="flex-1 min-w-0 bg-surface2 border border-line rounded-lg px-3 h-10 text-sm text-ink outline-none focus:border-maroon-light transition-colors placeholder:text-subtle"
                    />
                    <Button type="submit" variant="primary" disabled={assignMutation.isPending || !assignDeviceId.trim()}>
                      {assignMutation.isPending ? '...' : 'Assign'}
                    </Button>
                  </form>
                )}
                {assignError ? <div className="mt-2"><ErrorAlert>{assignError}</ErrorAlert></div> : null}
              </div>

              <div className="pt-2 border-t border-line">
                <Button
                  variant="secondary"
                  onClick={() => onDelete(playlist)}
                  disabled={isDeleting}
                  className="w-full justify-center gap-2 !text-maroon-light hover:!border-maroon-light"
                >
                  <FiTrash2 /> {isDeleting ? 'Deleting...' : 'Delete playlist'}
                </Button>
              </div>
            </div>
          ) : null}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PlaylistDetailsModal;