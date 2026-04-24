import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/axios";
import { RESELLER_ENDPOINTS } from "../api/endpoints";
import { PaginatedResponse, Reseller, ResellerAnalytics, SubReseller } from "../types/api.types";

export const useResellers = (page: number, size: number) => {
  return useQuery<PaginatedResponse<Reseller>, Error>({
    queryKey: ["resellers", page, size],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<Reseller>>(
        `${RESELLER_ENDPOINTS.LIST}?page=${page}&size=${size}`
      );
      return data;
    },
  });
};

export const useResellerStats = (id: string | undefined) => {
  return useQuery<any, Error>({
    queryKey: ["resellerStats", id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await apiClient.get<any>(RESELLER_ENDPOINTS.GET_STATS(id));
      return data;
    },
    enabled: !!id,
  });
};

export const useResellerAnalytics = (id: string | undefined, period: string = 'WEEK', startDate: string) => {
  return useQuery<ResellerAnalytics[], Error>({
    queryKey: ["resellerAnalytics", id, period, startDate],
    queryFn: async () => {
      if (!id) return [];
      const { data } = await apiClient.get<ResellerAnalytics[]>(
        `${RESELLER_ENDPOINTS.GET_ANALYTICS(id)}?period=${period}&startDate=${startDate}`
      );
      return data;
    },
    enabled: !!id && !!startDate,
  });
};

export const useSubResellers = (id: string | undefined, page: number = 0, size: number = 20) => {
  return useQuery<PaginatedResponse<SubReseller>, Error>({
    queryKey: ["subResellers", id, page, size],
    queryFn: async () => {
      if (!id) return { content: [], totalElements: 0, totalPages: 0 } as any;
      const { data } = await apiClient.get<PaginatedResponse<SubReseller>>(
        `${RESELLER_ENDPOINTS.GET_SUB_RESELLERS(id)}?page=${page}&size=${size}`
      );
      return data;
    },
    enabled: !!id,
  });
};

export const useToggleResellerStatus = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await apiClient.patch(RESELLER_ENDPOINTS.TOGGLE_STATUS(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resellers"] });
    },
  });
};

export const useCreateReseller = () => {
  const queryClient = useQueryClient();
  return useMutation<Reseller, Error, any>({
    mutationFn: async (reseller) => {
      const { data } = await apiClient.post<Reseller>(RESELLER_ENDPOINTS.CREATE, reseller);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resellers"] });
    },
  });
};

export const useUpdateReseller = () => {
  const queryClient = useQueryClient();
  return useMutation<Reseller, Error, { id: string; reseller: any }>({
    mutationFn: async ({ id, reseller }) => {
      const { data } = await apiClient.put<Reseller>(RESELLER_ENDPOINTS.UPDATE(id), reseller);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resellers"] });
    },
  });
};
