import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useHttpRequestService } from "../service/HttpRequestService";
import { queryKeys } from "./query-keys";
import { useToast } from "../contexts/ToastContext";

// Chats
export const useChats = () => {
  const service = useHttpRequestService();
  return useQuery({
    queryKey: queryKeys.chats,
    queryFn: () => service.getChats(),
  });
};

export const useConversations = () => {
  const service = useHttpRequestService();
  return useQuery({
    queryKey: ["conversations"],
    queryFn: () => service.getConversations(),
    refetchOnWindowFocus: true, // Still refetch when user returns to tab
    staleTime: 30 * 1000, // Consider data stale after 30 seconds
  });
};

export const useConversation = (
  partnerId: string,
  options?: { limit?: number; before?: string; after?: string }
) => {
  const service = useHttpRequestService();
  return useQuery({
    queryKey: ["conversation", partnerId, options],
    queryFn: () => service.getConversation(partnerId, options),
    enabled: !!partnerId,
    refetchOnWindowFocus: true, // Refetch when user returns to window
    refetchOnMount: true, // Always refetch when component mounts
    staleTime: 10 * 1000, // Consider data stale after 10 seconds so it refetches more often
  });
};

export const useChat = (chatId: string) => {
  const service = useHttpRequestService();
  return useQuery({
    queryKey: queryKeys.chat(chatId),
    queryFn: () => service.getChat(chatId),
    enabled: !!chatId,
  });
};

export const useCreateChat = () => {
  const service = useHttpRequestService();
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (userId: string) => service.createChat(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chats });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      showSuccess("Chat created successfully!");
    },
    onError: () => {
      showError("Failed to create chat. Please try again.");
    },
  });
};

export const useSendMessage = () => {
  const service = useHttpRequestService();
  const queryClient = useQueryClient();
  const { showError } = useToast();

  return useMutation({
    mutationFn: ({
      receiverId,
      content,
    }: {
      receiverId: string;
      content: { content: string };
    }) => service.sendMessage(receiverId, content),
    onSuccess: (_, variables) => {
      // Invalidate conversation and conversations queries
      queryClient.invalidateQueries({
        queryKey: ["conversation", variables.receiverId],
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: () => {
      showError("Failed to send message. Please try again.");
    },
  });
};

export const useMarkAsRead = () => {
  const service = useHttpRequestService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { conversationPartnerId: string }) =>
      service.markMessagesAsRead(data),
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ["conversation", variables.conversationPartnerId],
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["unread-count"] });
    },
  });
};

export const useUnreadCount = () => {
  const service = useHttpRequestService();
  return useQuery({
    queryKey: ["unread-count"],
    queryFn: () => service.getUnreadCount(),
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    staleTime: 30 * 1000, // Consider data stale after 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

export const useCanChat = (partnerId: string) => {
  const service = useHttpRequestService();
  return useQuery({
    queryKey: ["can-chat", partnerId],
    queryFn: () => service.canChat(partnerId),
    enabled: !!partnerId,
  });
};
