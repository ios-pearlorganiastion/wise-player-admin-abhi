import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../api/axios";
import { REPORT_ENDPOINTS } from "../api/endpoints";
import { RevenueReport, DeviceReport, SubscriptionReport, ResellerReport } from "../types/api.types";

export const useRevenueReport = (from: string, to: string) => {
  return useQuery<RevenueReport, Error>({
    queryKey: ["report-revenue", from, to],
    queryFn: async () => {
      const formattedFrom = from.includes('T') ? from : `${from}T00:00:00`;
      const formattedTo = to.includes('T') ? to : `${to}T23:59:59`;
      const { data } = await apiClient.get<RevenueReport>(
        `${REPORT_ENDPOINTS.REVENUE}?from=${formattedFrom}&to=${formattedTo}`
      );
      return data;
    },
    enabled: !!from && !!to,
  });
};

export const useDeviceReport = (from: string, to: string) => {
  return useQuery<DeviceReport, Error>({
    queryKey: ["report-devices", from, to],
    queryFn: async () => {
      const formattedFrom = from.includes('T') ? from : `${from}T00:00:00`;
      const formattedTo = to.includes('T') ? to : `${to}T23:59:59`;
      const { data } = await apiClient.get<DeviceReport>(
        `${REPORT_ENDPOINTS.DEVICES}?from=${formattedFrom}&to=${formattedTo}`
      );
      return data;
    },
    enabled: !!from && !!to,
  });
};

export const useSubscriptionReport = (from: string, to: string) => {
  return useQuery<SubscriptionReport, Error>({
    queryKey: ["report-subscriptions", from, to],
    queryFn: async () => {
      const formattedFrom = from.includes('T') ? from : `${from}T00:00:00`;
      const formattedTo = to.includes('T') ? to : `${to}T23:59:59`;
      const { data } = await apiClient.get<SubscriptionReport>(
        `${REPORT_ENDPOINTS.SUBSCRIPTIONS}?from=${formattedFrom}&to=${formattedTo}`
      );
      return data;
    },
    enabled: !!from && !!to,
  });
};

export const useResellerReport = (page: number = 0, size: number = 10) => {
  return useQuery<PaginatedResponse<ResellerReport>, Error>({
    queryKey: ["report-resellers", page, size],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<ResellerReport>>(
        `${REPORT_ENDPOINTS.RESELLERS}?page=${page}&size=${size}`
      );
      return data;
    },
  });
};
