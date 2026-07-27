import React, { useState, useMemo } from 'react';
import { FiActivity, FiSearch, FiTv, FiLink, FiTrash2, FiEye, FiStar, FiList, FiPlus } from 'react-icons/fi';
import { usePlaylists, useDeletePlaylist, useCreateXtreamPlaylist, useTogglePlaylistPin } from '../../hooks/usePlaylists';
import { useAuthContext } from '../../contexts/AuthContext';
import Sidebar from '../Shared/Sidebar';
import Card from '../common/Card';
import Spinner from '../common/Spinner';
import ErrorAlert from '../common/ErrorAlert';
import ConfirmModal from '../common/ConfirmModal';
import IconButton from '../common/IconButton';
import HamburgerIcon from '../common/HamburgerIcon';
import ProfileMenu from '../common/ProfileMenu';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import PlaylistDetailsModal from './PlaylistDetailsModal';

const Playlists = () => {
  const { user } = useAuthContext();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [selectedId, setSelectedId] = useState(null);
  const [selectedFallback, setSelectedFallback] = useState(null);
  const [confirmState, setConfirmState] = useState({ show: false, playlist: null });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', serverUrl: '', username: '', password: '' });
  const [createError, setCreateError] = useState('');

  const { data: playlists, isLoading, error } = usePlaylists();
  const deleteMutation = useDeletePlaylist();
  const createMutation = useCreateXtreamPlaylist();
  const pinMutation = useTogglePlaylistPin();

  const types = useMemo(() => {
    const set = new Set((playlists || []).map(p => p.type).filter(Boolean));
    return ['ALL', ...Array.from(set)];
  }, [playlists]);

  const filtered = useMemo(() => {
    if (!playlists) return [];
    const q = search.toLowerCase();
    return playlists.filter(p => {
      const matchesType = typeFilter === 'ALL' || p.type === typeFilter;
      const matchesSearch = !q ||
        p.name?.toLowerCase().includes(q) ||
        p.serverUrl?.toLowerCase().includes(q) ||
        p.username?.toLowerCase().includes(q) ||
        p.deviceId?.toLowerCase().includes(q);
      return matchesType && matchesSearch;
    });
  }, [playlists, search, typeFilter]);

  const handleView = (playlist) => {
    setSelectedFallback(playlist);
    setSelectedId(playlist.id);
  };

  const handleDeleteClick = (playlist) => {
    setConfirmState({ show: true, playlist });
  };

  const executeDelete = () => {
    const { playlist } = confirmState;
    if (playlist) {
      deleteMutation.mutate(playlist.id, {
        onSuccess: () => {
          setConfirmState({ show: false, playlist: null });
          if (selectedId === playlist.id) setSelectedId(null);
        }
      });
    }
  };

  const handleCreate = (e) => {
    e.preventDefault();
    setCreateError('');
    createMutation.mutate(createForm, {
      onSuccess: () => {
        setShowCreateModal(false);
        setCreateForm({ name: '', serverUrl: '', username: '', password: '' });
      },
      onError: (err) => setCreateError(err.response?.data?.message || 'Failed to create playlist.'),
    });
  };

  const handleTogglePin = (e, playlist) => {
    e.stopPropagation();
    pinMutation.mutate(playlist.id);
  };

  return (
    <div className="flex min-h-screen bg-base">
      <Sidebar
        activePage="playlists"
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
                Device <span className="text-maroon-light">Playlists</span>
              </h1>
              <p className="hidden sm:block text-subtle text-sm mt-0.5">Xtream and M3U playlists linked to devices</p>
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

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {types.map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`text-sm font-medium rounded-lg px-3.5 py-2 transition-colors ${
                    typeFilter === t
                      ? 'bg-maroon text-ink'
                      : 'text-subtle border border-line hover:text-ink'
                  }`}
                >
                  {t === 'ALL' ? 'All' : t}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-64">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle text-sm pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, server, device..."
                  className="w-full bg-surface2 border border-line rounded-lg pl-9 pr-3 h-10 text-sm text-ink outline-none focus:border-maroon-light transition-colors placeholder:text-subtle"
                />
              </div>
              <Button variant="primary" onClick={() => setShowCreateModal(true)} className="gap-2 shrink-0">
                <FiPlus /> Add playlist
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16"><Spinner /></div>
          ) : error ? (
            <ErrorAlert>Error loading playlists: {error.message}</ErrorAlert>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
              <FiList className="text-subtle text-2xl" />
              <h3 className="font-display font-semibold text-ink text-base">No playlists found</h3>
              <p className="text-subtle text-sm">
                {search || typeFilter !== 'ALL' ? 'Try a different search or filter.' : 'No playlists have been created yet.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((playlist) => (
                <Card
                  key={playlist.id}
                  className="hover:border-line hover:-translate-y-0.5 transition-transform duration-150 cursor-pointer"
                >
                  <div onClick={() => handleView(playlist)}>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-maroon/15 text-maroon-light flex items-center justify-center shrink-0">
                          {playlist.type === 'XTREAM' ? <FiTv /> : <FiLink />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-ink text-sm truncate">{playlist.name || 'Untitled'}</p>
                          <span className="text-[11px] font-medium text-sky-400 bg-sky-500/10 rounded-full px-2 py-0.5">
                            {playlist.type}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleTogglePin(e, playlist)}
                        disabled={pinMutation.isPending}
                        aria-label={playlist.pinned ? 'Unpin' : 'Pin'}
                        className={`shrink-0 transition-colors disabled:opacity-50 ${playlist.pinned ? 'text-amber-400' : 'text-subtle hover:text-amber-400'}`}
                      >
                        <FiStar className={playlist.pinned ? 'fill-current' : ''} />
                      </button>
                    </div>

                    <p className="text-subtle text-xs truncate mb-1" title={playlist.serverUrl}>
                      {playlist.serverUrl || playlist.m3uUrl || 'No server URL'}
                    </p>
                    <p className="font-mono text-subtle text-[11px] truncate" title={playlist.deviceId}>
                      {playlist.deviceId || 'Unassigned'}
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-line">
                    <IconButton icon={<FiEye />} title="View details" onClick={() => handleView(playlist)} />
                    <IconButton
                      icon={<FiTrash2 />}
                      variant="danger"
                      title="Delete playlist"
                      onClick={() => handleDeleteClick(playlist)}
                    />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>

      {selectedId ? (
        <PlaylistDetailsModal
          playlistId={selectedId}
          fallback={selectedFallback}
          onClose={() => { setSelectedId(null); setSelectedFallback(null); }}
          onDelete={handleDeleteClick}
          isDeleting={deleteMutation.isPending}
        />
      ) : null}

      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} title="Add Xtream playlist">
        <form onSubmit={handleCreate}>
          {createError ? <div className="mb-4"><ErrorAlert>{createError}</ErrorAlert></div> : null}
          <Input
            label="Name"
            type="text"
            required
            value={createForm.name}
            onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
            placeholder="e.g. My Xtream Playlist"
          />
          <Input
            label="Server URL"
            type="text"
            required
            value={createForm.serverUrl}
            onChange={(e) => setCreateForm({ ...createForm, serverUrl: e.target.value })}
            placeholder="http://xtream-server.com"
          />
          <Input
            label="Username"
            type="text"
            required
            value={createForm.username}
            onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
          />
          <Input
            label="Password"
            type="text"
            required
            value={createForm.password}
            onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
          />
          <Button type="submit" variant="primary" className="w-full justify-center mt-2" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Verifying...' : 'Create playlist'}
          </Button>
        </form>
      </Modal>

      <ConfirmModal
        show={confirmState.show}
        onHide={() => setConfirmState({ show: false, playlist: null })}
        onConfirm={executeDelete}
        title="Delete playlist?"
        message={`Are you sure you want to delete "${confirmState.playlist?.name || 'this playlist'}"? This action is permanent and cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default Playlists;