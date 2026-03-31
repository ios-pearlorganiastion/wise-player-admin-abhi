import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/axios";
import { SUBSCRIPTIONS_ENDPOINTS } from "../api/endpoints";
import { PaginatedResponse, Subscription, ManualSubscriptionRequest } from "../types/api.types";

export const useSubscriptions = (page: number, size: number, filters: { deviceId?: string; plan?: string; status?: string } = {}) => {
  const hasFilters = !!(filters.deviceId || filters.plan || filters.status);
  const effectivePage = hasFilters ? 0 : page;
  const effectiveSize = hasFilters ? 1000 : size; // Fetch all when filtering

  return useQuery<PaginatedResponse<Subscription>, Error>({
    queryKey: ["subscriptions", effectivePage, effectiveSize, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: effectivePage.toString(),
        size: effectiveSize.toString(),
      });
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
