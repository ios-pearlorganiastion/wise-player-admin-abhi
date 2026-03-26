import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../api/axios";
import { DASHBOARD_ENDPOINTS } from "../api/endpoints";
import { DashboardStats } from "../types/api.types";

export const useDashboardStats = () => {
  return useQuery<DashboardStats, Error>({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      const { data } = await apiClient.get<DashboardStats>(DASHBOARD_ENDPOINTS.STATS);
      return data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time counters
  });
};
