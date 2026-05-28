import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/axios";
import { DEVICES_ENDPOINTS } from "../api/endpoints";
import { PaginatedResponse, Device, UpdateDeviceStatusRequest } from "../types/api.types";

export interface DeviceFilters {
  deviceId?: string;
  status?: string;
  subscription?: string;
  model?: string;
  platform?: string;
}

export const useDevices = (page: number, size: number, filters?: DeviceFilters) => {
  return useQuery<PaginatedResponse<Device>, Error>({
    queryKey: ["devices", page, size, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("size", size.toString());
      if (filters) {
        if (filters.deviceId) params.append("deviceId", filters.deviceId);
        if (filters.status) params.append("status", filters.status);
        if (filters.subscription) params.append("subscription", filters.subscription);
        if (filters.model) params.append("model", filters.model);
        if (filters.platform) params.append("platform", filters.platform);
      }
      const { data } = await apiClient.get<PaginatedResponse<Device>>(
        `${DEVICES_ENDPOINTS.LIST}?${params.toString()}`
      );
      return data;
    },
  });
};

export const useDevice = (deviceId: string) => {
  return useQuery<Device, Error>({
    queryKey: ["device", deviceId],
    queryFn: async () => {
      const { data } = await apiClient.get<Device>(DEVICES_ENDPOINTS.GET_BY_ID(deviceId));
      return data;
    },
    enabled: !!deviceId,
  });
};

export const useUpdateDeviceStatus = () => {
  const queryClient = useQueryClient();
  return useMutation<Device, Error, { deviceId: string; status: "ACTIVE" | "INACTIVE" }>({
    mutationFn: async ({ deviceId, status }) => {
      const { data } = await apiClient.patch<Device>(
        DEVICES_ENDPOINTS.UPDATE_STATUS(deviceId),
        { status } as UpdateDeviceStatusRequest
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      queryClient.invalidateQueries({ queryKey: ["device", variables.deviceId] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
};

export const useDeleteDevice = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (deviceId) => {
      await apiClient.delete(DEVICES_ENDPOINTS.DELETE(deviceId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
};
