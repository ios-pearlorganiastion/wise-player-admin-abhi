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

export const useResellerReport = () => {
  return useQuery<ResellerReport[], Error>({
    queryKey: ["report-resellers"],
    queryFn: async () => {
      const { data } = await apiClient.get<ResellerReport[]>(REPORT_ENDPOINTS.RESELLERS);
      return data;
    },
  });
};
