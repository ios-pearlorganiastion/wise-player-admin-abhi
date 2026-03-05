import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/axios";
import { SUBSCRIPTIONS_ENDPOINTS } from "../api/endpoints";
import { PaginatedResponse, Subscription, ManualSubscriptionRequest } from "../types/api.types";

export const useSubscriptions = (page: number, size: number) => {
  return useQuery<PaginatedResponse<Subscription>, Error>({
    queryKey: ["subscriptions", page, size],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<Subscription>>(
        `${SUBSCRIPTIONS_ENDPOINTS.LIST}?page=${page}&size=${size}`
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
