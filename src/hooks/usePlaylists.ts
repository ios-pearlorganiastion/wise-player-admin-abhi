import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/axios";
import { PLAYLIST_ENDPOINTS } from "../api/endpoints";
import { Playlist } from "../types/api.types";

export const usePlaylists = () => {
  return useQuery<Playlist[], Error>({
    queryKey: ["playlists"],
    queryFn: async () => {
      const { data } = await apiClient.get(PLAYLIST_ENDPOINTS.LIST);
      return Array.isArray(data) ? data : (data?.data ?? []);
    },
  });
};

export const usePlaylist = (id: string | null) => {
  return useQuery<Playlist, Error>({
    queryKey: ["playlist", id],
    queryFn: async () => {
      const { data } = await apiClient.get(PLAYLIST_ENDPOINTS.GET_BY_ID(id as string));
      return data?.data ?? data;
    },
    enabled: !!id,
  });
};

export const useDeletePlaylist = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, string>({
    mutationFn: async (id) => {
      const { data } = await apiClient.delete(PLAYLIST_ENDPOINTS.DELETE(id));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
    },
  });
};

export const useCreateXtreamPlaylist = () => {
  const queryClient = useQueryClient();
  return useMutation<Playlist, any, { name: string; serverUrl: string; username: string; password: string }>({
    mutationFn: async (payload) => {
      const { data } = await apiClient.post(PLAYLIST_ENDPOINTS.CREATE_XTREAM, payload);
      return data?.data ?? data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
    },
  });
};

export const useUpdatePlaylist = () => {
  const queryClient = useQueryClient();
  return useMutation<Playlist, any, { id: string; payload: Partial<Playlist> }>({
    mutationFn: async ({ id, payload }) => {
      const { data } = await apiClient.patch(PLAYLIST_ENDPOINTS.UPDATE(id), payload);
      return data?.data ?? data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
      queryClient.invalidateQueries({ queryKey: ["playlist", variables.id] });
    },
  });
};

export const useAssignPlaylist = () => {
  const queryClient = useQueryClient();
  return useMutation<Playlist, any, { id: string; deviceId: string }>({
    mutationFn: async ({ id, deviceId }) => {
      const { data } = await apiClient.put(PLAYLIST_ENDPOINTS.ASSIGN(id), { deviceId });
      return data?.data ?? data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
      queryClient.invalidateQueries({ queryKey: ["playlist", variables.id] });
    },
  });
};

export const useUnassignPlaylist = () => {
  const queryClient = useQueryClient();
  return useMutation<Playlist, any, string>({
    mutationFn: async (id) => {
      const { data } = await apiClient.delete(PLAYLIST_ENDPOINTS.UNASSIGN(id));
      return data?.data ?? data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
      queryClient.invalidateQueries({ queryKey: ["playlist", id] });
    },
  });
};

export const useTogglePlaylistPin = () => {
  const queryClient = useQueryClient();
  return useMutation<Playlist, Error, string>({
    mutationFn: async (id) => {
      const { data } = await apiClient.patch(PLAYLIST_ENDPOINTS.TOGGLE_PIN(id));
      return data?.data ?? data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
      queryClient.invalidateQueries({ queryKey: ["playlist", id] });
    },
  });
};