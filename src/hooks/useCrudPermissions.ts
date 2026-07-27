import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../api/axios";
import { CRUD_PERMISSIONS_ENDPOINTS } from "../api/endpoints";
import { CrudPermissionsResponse } from "../types/api.types";

export const useCrudPermissions = () => {
  return useQuery<CrudPermissionsResponse, Error>({
    queryKey: ["crud-permissions"],
    queryFn: async () => {
      const { data } = await apiClient.get<CrudPermissionsResponse>(CRUD_PERMISSIONS_ENDPOINTS.GET);
      return data;
    },
  });
};