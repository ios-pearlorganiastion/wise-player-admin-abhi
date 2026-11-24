import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/axios";
import { ADMIN_MANAGEMENT_ENDPOINTS } from "../api/endpoints";
import {
  AdminAccount,
  AdminCreateRequest,
  AdminDeleteResponse,
  AdminListResponse,
  AdminUpdateRequest,
} from "../types/api.types";

const ADMIN_LIST_KEY = ["admin-accounts"];

/** Pulls a readable message out of an Axios error (or falls back). */
export const getAdminApiError = (err: any, fallback: string): string =>
  err?.response?.data?.message || err?.response?.data?.error || err?.message || fallback;

/**
 * GET /api/admin/management/all
 * Response shape: { bulkPermissions, content: AdminAccount[] }
 * (also tolerates a plain array so an older backend does not break the page)
 */
export const useAdminAccounts = () => {
  return useQuery<AdminListResponse, Error>({
    queryKey: ADMIN_LIST_KEY,
    queryFn: async () => {
      const { data } = await apiClient.get<AdminListResponse | AdminAccount[]>(
        ADMIN_MANAGEMENT_ENDPOINTS.LIST_ALL
      );
      if (Array.isArray(data)) return { bulkPermissions: null, content: data };
      return { bulkPermissions: data?.bulkPermissions ?? null, content: data?.content ?? [] };
    },
  });
};

/** GET /api/admin/management/{id} */
export const useAdminAccount = (id: string | null) => {
  return useQuery<AdminAccount, Error>({
    queryKey: ["admin-account", id],
    queryFn: async () => {
      const { data } = await apiClient.get<AdminAccount>(ADMIN_MANAGEMENT_ENDPOINTS.GET_BY_ID(id as string));
      return data;
    },
    enabled: !!id,
  });
};

/** POST /api/admin/management/create */
export const useCreateAdminAccount = () => {
  const queryClient = useQueryClient();
  return useMutation<AdminAccount, any, AdminCreateRequest>({
    mutationFn: async (payload) => {
      const { data } = await apiClient.post<AdminAccount>(ADMIN_MANAGEMENT_ENDPOINTS.CREATE, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_LIST_KEY });
    },
  });
};

/** PUT /api/admin/management/{id} */
export const useUpdateAdminAccount = () => {
  const queryClient = useQueryClient();
  return useMutation<AdminAccount, any, { id: string; payload: AdminUpdateRequest }>({
    mutationFn: async ({ id, payload }) => {
      const { data } = await apiClient.put<AdminAccount>(ADMIN_MANAGEMENT_ENDPOINTS.UPDATE(id), payload);
      return data;
    },
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_LIST_KEY });
      queryClient.invalidateQueries({ queryKey: ["admin-account", id] });
    },
  });
};

/** PATCH /api/admin/management/{id}/status */
export const useToggleAdminStatus = () => {
  const queryClient = useQueryClient();
  return useMutation<AdminAccount, any, string>({
    mutationFn: async (id) => {
      const { data } = await apiClient.patch<AdminAccount>(ADMIN_MANAGEMENT_ENDPOINTS.TOGGLE_STATUS(id));
      return data;
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_LIST_KEY });
      queryClient.invalidateQueries({ queryKey: ["admin-account", id] });
    },
  });
};

/** DELETE /api/admin/management/{id} -> { message, success } */
export const useDeleteAdminAccount = () => {
  const queryClient = useQueryClient();
  return useMutation<AdminDeleteResponse, any, string>({
    mutationFn: async (id) => {
      const { data } = await apiClient.delete<AdminDeleteResponse>(ADMIN_MANAGEMENT_ENDPOINTS.DELETE(id));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_LIST_KEY });
    },
  });
};

/*
 * Invite flow endpoints are already wired elsewhere and need no change:
 *   POST /invite                -> useInviteAdmin()      (hooks/useAuth.ts)
 *   GET  /invite/verify?token=  -> AdminSetup.jsx
 *   POST /setup/complete        -> useCompleteSetup()    (hooks/useAuth.ts)
 */
