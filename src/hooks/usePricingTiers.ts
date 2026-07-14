import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/axios";
import { PRICING_TIER_ENDPOINTS } from "../api/endpoints";
import { PricingTier, PricingTierRequest } from "../types/api.types";

const PRICING_TIERS_KEY = ["pricing-tiers"];

export const usePricingTiers = () => {
  return useQuery<PricingTier[]>({
    queryKey: PRICING_TIERS_KEY,
    queryFn: async () => {
      const { data } = await apiClient.get<PricingTier[]>(PRICING_TIER_ENDPOINTS.LIST);
      // Sort by minQuantity so tiers read top-to-bottom in ascending order
      return [...data].sort((a, b) => a.minQuantity - b.minQuantity);
    },
  });
};

export const useCreatePricingTier = () => {
  const queryClient = useQueryClient();
  return useMutation<PricingTier, any, PricingTierRequest>({
    mutationFn: async (payload) => {
      const { data } = await apiClient.post<PricingTier>(PRICING_TIER_ENDPOINTS.CREATE, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRICING_TIERS_KEY }); // fire-and-forget, not awaited
    },
  });
};

export const useUpdatePricingTier = () => {
  const queryClient = useQueryClient();
  return useMutation<PricingTier, any, { id: string; tier: PricingTierRequest }>({
    mutationFn: async ({ id, tier }) => {
      const { data } = await apiClient.put<PricingTier>(PRICING_TIER_ENDPOINTS.UPDATE(id), tier);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRICING_TIERS_KEY });
    },
  });
};