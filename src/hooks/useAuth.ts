import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../api/axios";
import { AUTH_ENDPOINTS } from "../api/endpoints";
import { LoginRequest, LoginResponse, SetupRequest } from "../types/api.types";
import { useAuthContext } from "../contexts/AuthContext";

export const useLogin = () => {
  const { login } = useAuthContext();
  
  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: async (credentials) => {
      const { data } = await apiClient.post<LoginResponse>(AUTH_ENDPOINTS.LOGIN, credentials);
      return data;
    },
    onSuccess: (data) => {
      login(data.token);
    },
  });
};

export const useSetup = () => {
  return useMutation<void, Error, SetupRequest>({
    mutationFn: async (userData) => {
      await apiClient.post(AUTH_ENDPOINTS.SETUP, userData);
    },
  });
};
