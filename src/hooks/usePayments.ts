import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../api/axios";
import { PAYMENTS_ENDPOINTS } from "../api/endpoints";
import { PaginatedResponse, Payment, PaymentStats } from "../types/api.types";

export const usePayments = (page: number, size: number) => {
  return useQuery<PaginatedResponse<Payment>, Error>({
    queryKey: ["payments", page, size],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<Payment>>(
        `${PAYMENTS_ENDPOINTS.LIST}?page=${page}&size=${size}`
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
