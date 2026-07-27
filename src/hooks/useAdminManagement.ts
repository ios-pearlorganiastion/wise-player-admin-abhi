import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/axios";
import { ADMIN_MANAGEMENT_ENDPOINTS } from "../api/endpoints";
import { AdminAccount, AdminUpdateRequest } from "../types/api.types";

export const useAdminAccounts = () => {
  return useQuery<AdminAccount[], Error>({
    queryKey: ["admin-accounts"],
    queryFn: async () => {
      const { data } = await apiClient.get<AdminAccount[]>(ADMIN_MANAGEMENT_ENDPOINTS.LIST_ALL);
      return data;
    },
  });
};

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

export const useUpdateAdminAccount = () => {
  const queryClient = useQueryClient();
  return useMutation<AdminAccount, any, { id: string; payload: AdminUpdateRequest }>({
    mutationFn: async ({ id, payload }) => {
      const { data } = await apiClient.put<AdminAccount>(ADMIN_MANAGEMENT_ENDPOINTS.UPDATE(id), payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-accounts"] });
    },
  });
};

export const useToggleAdminStatus = () => {
  const queryClient = useQueryClient();
  return useMutation<AdminAccount, Error, string>({
    mutationFn: async (id) => {
      const { data } = await apiClient.put<AdminAccount>(ADMIN_MANAGEMENT_ENDPOINTS.TOGGLE_STATUS(id));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-accounts"] });
    },
  });
};

export const useDeleteAdminAccount = () => {
  const queryClient = useQueryClient();
  return useMutation<void, any, string>({
    mutationFn: async (id) => {
      await apiClient.delete(ADMIN_MANAGEMENT_ENDPOINTS.DELETE(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-accounts"] });
    },
  });
};