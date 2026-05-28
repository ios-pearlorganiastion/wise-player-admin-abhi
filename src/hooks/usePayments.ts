import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../api/axios";
import { PAYMENTS_ENDPOINTS } from "../api/endpoints";
import { PaginatedResponse, Payment, PaymentStats } from "../types/api.types";

export interface PaymentFilters {
  paymentId?: string;
  deviceId?: string;
  status?: string;
}

export const usePayments = (page: number, size: number, filters?: PaymentFilters) => {
  return useQuery<PaginatedResponse<Payment>, Error>({
    queryKey: ["payments", page, size, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("size", size.toString());
      if (filters) {
        if (filters.paymentId) params.append("paymentId", filters.paymentId);
        if (filters.deviceId) params.append("deviceId", filters.deviceId);
        if (filters.status) params.append("status", filters.status);
      }
      const { data } = await apiClient.get<PaginatedResponse<Payment>>(
        `${PAYMENTS_ENDPOINTS.LIST}?${params.toString()}`
      );
      return data;
    },
  });
};

export const usePaymentStats = () => {
  return useQuery<PaymentStats, Error>({
    queryKey: ["paymentStats"],
    queryFn: async () => {
      const { data } = await apiClient.get<PaymentStats>(PAYMENTS_ENDPOINTS.STATS);
      return data;
    },
  });
};
