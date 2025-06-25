import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useHttpRequestService } from "../service/HttpRequestService";
import { queryKeys } from "./query-keys";

// Chats
export const useChats = () => {
  const service = useHttpRequestService();
  return useQuery({
    queryKey: queryKeys.chats,
    queryFn: () => service.getChats(),
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

  return useMutation({
    mutationFn: (userId: string) => service.createChat(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chats });
    },
  });
};
