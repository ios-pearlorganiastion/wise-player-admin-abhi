import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/axios";
import { ACTIVATION_ENDPOINTS } from "../api/endpoints";
import { ActivationRequest, PaginatedResponse } from "../types/api.types";

export interface ActivationFilters {
  status?: string;
  deviceId?: string;
  planName?: string;
}

export const useActivationRequests = (page: number, size: number, filters?: ActivationFilters) => {
  return useQuery<PaginatedResponse<ActivationRequest>, Error>({
    queryKey: ["activation-requests", page, size, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("size", size.toString());
      if (filters) {
        if (filters.status) params.append("status", filters.status);
        if (filters.deviceId) params.append("deviceId", filters.deviceId);
        if (filters.planName) params.append("planName", filters.planName);
      }
      const { data } = await apiClient.get<PaginatedResponse<ActivationRequest>>(
        `${ACTIVATION_ENDPOINTS.LIST}?${params.toString()}`
      );
      return data;
    },
  });
};

export const useApproveActivation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { id: string; adminNotes: string }>({
    mutationFn: async ({ id, adminNotes }) => {
      await apiClient.post(ACTIVATION_ENDPOINTS.APPROVE(id), { adminNotes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activation-requests"] });
    },
  });
};

export const useRejectActivation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { id: string; adminNotes: string }>({
    mutationFn: async ({ id, adminNotes }) => {
      await apiClient.post(ACTIVATION_ENDPOINTS.REJECT(id), { adminNotes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activation-requests"] });
    },
  });
};
