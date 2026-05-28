import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/axios";
import { SUBSCRIPTIONS_ENDPOINTS } from "../api/endpoints";
import { PaginatedResponse, Subscription, ManualSubscriptionRequest } from "../types/api.types";

export interface SubscriptionFilters {
  deviceId?: string;
  plan?: string;
  status?: string;
}

export const useSubscriptions = (page: number, size: number, filters?: SubscriptionFilters) => {
  return useQuery<PaginatedResponse<Subscription>, Error>({
    queryKey: ["subscriptions", page, size, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("size", size.toString());
      if (filters) {
        if (filters.deviceId) params.append("deviceId", filters.deviceId);
        if (filters.plan) params.append("plan", filters.plan);
        if (filters.status) params.append("status", filters.status);
      }
      const { data } = await apiClient.get<PaginatedResponse<Subscription>>(
        `${SUBSCRIPTIONS_ENDPOINTS.LIST}?${params.toString()}`
      );
      return data;
    },
  });
};

export const useCreateManualSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, ManualSubscriptionRequest>({
    mutationFn: async (payload) => {
      await apiClient.post(SUBSCRIPTIONS_ENDPOINTS.MANUAL, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
};

export const useDeleteSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (subscriptionId) => {
      await apiClient.delete(SUBSCRIPTIONS_ENDPOINTS.DELETE(subscriptionId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
};
