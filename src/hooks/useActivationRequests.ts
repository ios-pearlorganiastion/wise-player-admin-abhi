import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/axios";
import { ACTIVATION_ENDPOINTS } from "../api/endpoints";
import { ActivationRequest, PaginatedResponse } from "../types/api.types";

export const useActivationRequests = (status: string, page: number, size: number) => {
  return useQuery<PaginatedResponse<ActivationRequest>, Error>({
    queryKey: ["activation-requests", status, page, size],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<ActivationRequest>>(
        `${ACTIVATION_ENDPOINTS.LIST}?status=${status}&page=${page}&size=${size}`
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
