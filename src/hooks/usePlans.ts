import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/axios";
import { PLAN_ENDPOINTS } from "../api/endpoints";
import { Plan, PaginatedResponse } from "../types/api.types";

export const usePlans = (page: number, size: number) => {
  return useQuery<PaginatedResponse<Plan>, Error>({
    queryKey: ["plans", page, size],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<Plan>>(
        `${PLAN_ENDPOINTS.LIST_ALL}?page=${page}&size=${size}`
      );
      return data;
    },
  });
};

// Fetches ALL plans (no pagination) — used in dropdowns
export const useAllPlans = () => {
  return useQuery<Plan[], Error>({
    queryKey: ["plans-all"],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<Plan>>(
        `${PLAN_ENDPOINTS.LIST_ALL}?page=0&size=200`
      );
      return data.content || [];
    },
  });
};

export const useCreatePlan = () => {
  const queryClient = useQueryClient();
  return useMutation<Plan, Error, Partial<Plan>>({
    mutationFn: async (plan) => {
      const { data } = await apiClient.post<Plan>(PLAN_ENDPOINTS.CREATE, plan);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
    },
  });
};

export const useUpdatePlan = () => {
  const queryClient = useQueryClient();
  return useMutation<Plan, Error, { id: string; plan: Partial<Plan> }>({
    mutationFn: async ({ id, plan }) => {
      const { data } = await apiClient.put<Plan>(PLAN_ENDPOINTS.UPDATE(id), plan);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
    },
  });
};

export const useTogglePlanStatus = () => {
  const queryClient = useQueryClient();
  return useMutation<Plan, Error, string>({
    mutationFn: async (id) => {
      const { data } = await apiClient.patch<Plan>(PLAN_ENDPOINTS.TOGGLE_STATUS(id));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
    },
  });
};
