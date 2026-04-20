import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/axios";
import { SUPPORT_TICKETS_ENDPOINTS } from "../api/endpoints";
import { PaginatedResponse, SupportTicket, TicketStatus, UpdateTicketStatusRequest } from "../types/api.types";

export const useSupportTickets = (page: number, size: number, status?: TicketStatus) => {
  return useQuery<PaginatedResponse<SupportTicket>, Error>({
    queryKey: ["support-tickets", page, size, status],
    queryFn: async () => {
      let url = `${SUPPORT_TICKETS_ENDPOINTS.LIST}?page=${page}&size=${size}`;
      if (status) {
        url += `&status=${status}`;
      }
      const { data } = await apiClient.get<PaginatedResponse<SupportTicket>>(url);
      return data;
    },
  });
};

export const useSupportTicketDetails = (id: string) => {
  return useQuery<SupportTicket, Error>({
    queryKey: ["support-ticket", id],
    queryFn: async () => {
      const { data } = await apiClient.get<SupportTicket>(SUPPORT_TICKETS_ENDPOINTS.GET_BY_ID(id));
      return data;
    },
    enabled: !!id,
  });
};

export const useSupportTicketsCount = (status?: TicketStatus) => {
  return useQuery<number, Error>({
    queryKey: ["support-tickets-count", status],
    queryFn: async () => {
      let url = `${SUPPORT_TICKETS_ENDPOINTS.LIST}?page=0&size=1`;
      if (status) {
        url += `&status=${status}`;
      }
      const { data } = await apiClient.get<PaginatedResponse<SupportTicket>>(url);
      return data.totalElements;
    },
    refetchInterval: 30000, 
  });
};

export const useUpdateTicketStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<SupportTicket, Error, { id: string; status: TicketStatus }>({
    mutationFn: async ({ id, status }) => {
      const { data } = await apiClient.patch<SupportTicket>(
        SUPPORT_TICKETS_ENDPOINTS.UPDATE_STATUS(id),
        { status } as UpdateTicketStatusRequest
      );
      return data;
    },
    // Optimistic Update
    onMutate: async (newStatusUpdate) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["support-tickets"] });
      await queryClient.cancelQueries({ queryKey: ["support-ticket", newStatusUpdate.id] });

      // Snapshot the previous value
      const previousTickets = queryClient.getQueryData(["support-tickets"]);
      const previousTicketDetails = queryClient.getQueryData(["support-ticket", newStatusUpdate.id]);

      // Optimistically update the single ticket details if it exists
      if (previousTicketDetails) {
        queryClient.setQueryData(["support-ticket", newStatusUpdate.id], (old: any) => ({
          ...old,
          status: newStatusUpdate.status,
        }));
      }

      // Optimistically update the list if it exists
      // This is a bit complex for paginated data, but we can try to find and update the item
      queryClient.setQueriesData({ queryKey: ["support-tickets"] }, (old: any) => {
        if (!old || !old.content) return old;
        return {
          ...old,
          content: old.content.map((t: SupportTicket) =>
            t.id === newStatusUpdate.id ? { ...t, status: newStatusUpdate.status } : t
          ),
        };
      });

      return { previousTickets, previousTicketDetails };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, newStatusUpdate, context: any) => {
      if (context?.previousTickets) {
        queryClient.setQueryData(["support-tickets"], context.previousTickets);
      }
      if (context?.previousTicketDetails) {
        queryClient.setQueryData(["support-ticket", newStatusUpdate.id], context.previousTicketDetails);
      }
    },
    // Always refetch after error or success:
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["support-ticket", variables.id] });
    },
  });
};
