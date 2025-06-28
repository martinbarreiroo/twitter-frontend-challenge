import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
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

export const useInfiniteConversation = (
  partnerId: string,
  limit: number = 30
) => {
  const service = useHttpRequestService();

  return useInfiniteQuery({
    queryKey: ["infinite-conversation", partnerId],
    queryFn: ({ pageParam }) => {
      const options: { limit: number; before?: string } = { limit };
      if (pageParam) {
        options.before = pageParam;
      }
      return service.getConversation(partnerId, options);
    },
    enabled: !!partnerId,
    getNextPageParam: (lastPage) => {
      // If we got fewer messages than the limit, we've reached the end
      if (!lastPage || lastPage.length < limit) {
        return undefined;
      }
      // Use the oldest message's createdAt timestamp as the cursor for the next page
      return lastPage[lastPage.length - 1]?.createdAt; // Use the last (oldest) message
    },
    initialPageParam: undefined,
    refetchOnMount: false, // Don't auto-refetch on mount, let reset handle it
    refetchOnWindowFocus: false, // Don't refetch when user returns to tab
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
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
      // Only invalidate conversations list (to update last message)
      queryClient.invalidateQueries({ queryKey: ["conversations"] });

      // Don't automatically refetch the infinite conversation
      // Let the real-time socket updates handle new messages
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
      // Only invalidate what's necessary
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["unread-count"] });

      // Update the infinite conversation data to mark messages as read
      queryClient.setQueryData(
        ["infinite-conversation", variables.conversationPartnerId],
        (oldData: any) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page: any) =>
              page.map((message: any) =>
                message.senderId === variables.conversationPartnerId
                  ? { ...message, isRead: true }
                  : message
              )
            ),
          };
        }
      );
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
