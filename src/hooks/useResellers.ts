import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/axios";
import { RESELLER_ENDPOINTS } from "../api/endpoints";
import { PaginatedResponse, Reseller } from "../types/api.types";

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
