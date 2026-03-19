import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../api/axios";
import { AUTH_ENDPOINTS } from "../api/endpoints";
import { LoginRequest, LoginResponse } from "../types/api.types";
import { useAuthContext } from "../contexts/AuthContext";

export const useLogin = () => {
  const { login } = useAuthContext();
  
  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: async (credentials) => {
      const { data } = await apiClient.post<LoginResponse>(AUTH_ENDPOINTS.LOGIN, credentials);
      return data;
    },
    onSuccess: (data) => {
      const { token, ...userData } = data;
      login(token, userData);
    },
  });
};

// Setup flow removed as per user request

export const useInviteAdmin = () => {
  return useMutation<{ token: string; inviteUrl: string }, any, { email: string }>({
    mutationFn: async (data) => {
      try {
        const response = await apiClient.post(AUTH_ENDPOINTS.INVITE, data);
        return response.data;
      } catch (err: any) {
        throw new Error(err.response?.data?.message || "Failed to send invitation.");
      }
    },
  });
};

export const useCompleteSetup = () => {
  return useMutation<void, any, { token: string; password: string; fullName: string }>({
    mutationFn: async (data) => {
      try {
        await apiClient.post(AUTH_ENDPOINTS.COMPLETE_SETUP, data);
      } catch (err: any) {
        throw new Error(err.response?.data?.message || "Failed to complete setup.");
      }
    },
  });
};

