import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/axios";
import { DEVICES_ENDPOINTS } from "../api/endpoints";
import { PaginatedResponse, Device, UpdateDeviceStatusRequest } from "../types/api.types";

export const useDevices = (page: number, size: number) => {
  return useQuery<PaginatedResponse<Device>, Error>({
    queryKey: ["devices", page, size],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<Device>>(
        `${DEVICES_ENDPOINTS.LIST}?page=${page}&size=${size}`
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
