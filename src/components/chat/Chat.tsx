import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useInfiniteConversation, useMarkAsRead } from "../../hooks/useChats";
import { useCurrentUser, useProfile } from "../../hooks/useUser";
import socketService, { Message } from "../../service/socketService";
import { useQueryClient } from "@tanstack/react-query";
import styled from "styled-components";
import Icon from "../../assets/icon.jpg";

// Modular components
import ChatHeader from "./ChatHeader";
import ConnectionStatus from "./ConnectionStatus";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { useSocketConnection } from "./useSocketConnection";
import { useMessageHandling } from "./useMessageHandling";

const StyledChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 500px;
  border: 1px solid ${(props) => props.theme.colors.containerLine};
  border-radius: 16px;
  background: ${(props) => props.theme.background};
`;

interface ChatProps {
  partnerId: string;
  partnerName?: string;
  partnerUsername?: string;
  partnerProfilePicture?: string;
  onClose?: () => void;
}

const BUCKET_URL = process.env.REACT_APP_BUCKET_URL;

const Chat: React.FC<ChatProps> = ({
  partnerId,
  partnerName,
  partnerUsername,
  partnerProfilePicture,
  onClose,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);

  const { data: user } = useCurrentUser();
  const { data: partnerProfile } = useProfile(partnerId);

  // Use infinite query for all messages
  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteConversation(partnerId, 30);

  const markAsReadMutation = useMarkAsRead();
  const queryClient = useQueryClient();

  // Track if we've already reset for this partner to prevent multiple resets
  const resetRef = useRef<string | null>(null);

  // Reset to latest messages when entering/re-entering chat
  useEffect(() => {
    if (partnerId && user?.id && resetRef.current !== partnerId) {
      resetRef.current = partnerId;
      // Reset infinite query state to start fresh with latest messages
      queryClient.resetQueries({
        queryKey: ["infinite-conversation", partnerId],
        exact: true,
      });
    }
  }, [partnerId, user?.id]); // Removed queryClient from dependencies

  // Get conversation data from infinite query
  const conversationData = useMemo(() => {
    if (!infiniteData?.pages) return [];
    return infiniteData.pages.flat();
  }, [infiniteData]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Socket connection management
  const { connectionStatus } = useSocketConnection({
    partnerId,
    currentUserId: user?.id,
    onMessageReceived: useCallback((message: Message) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) {
          return prev;
        }
        const updated = [...prev, message].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        setShouldScrollToBottom(true);
        return updated;
      });
    }, []),
    onTypingUpdate: setPartnerTyping,
    onMessagesMarkedAsRead: useCallback(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.senderId === user?.id ? { ...msg, isRead: true } : msg
        )
      );
    }, [user?.id]),
  });

  // Message handling
  const messageHandling = useMessageHandling({
    partnerId,
    currentUserId: user?.id,
    onMessageSent: useCallback(() => {
      setShouldScrollToBottom(true);
    }, []),
  });

  // Trigger scroll to bottom when conversation data loads for the first time
  useEffect(() => {
    if (conversationData.length > 0 && partnerId) {
      setShouldScrollToBottom(true);
    }
  }, [conversationData.length, partnerId]);

  // Clear UI state when switching partners
  useEffect(() => {
    // Only clear real-time messages, not the infinite query cache
    setMessages((prevMessages) =>
      prevMessages.filter(
        (msg) =>
          !(
            (msg.senderId === partnerId && msg.receiverId === user?.id) ||
            (msg.senderId === user?.id && msg.receiverId === partnerId)
          )
      )
    );
    setPartnerTyping(false);
    setShouldScrollToBottom(false);
    messageHandling.setNewMessage("");
  }, [partnerId, user?.id, messageHandling.setNewMessage]);

  // Mark messages as read
  useEffect(() => {
    if (conversationData && conversationData.length > 0 && user?.id) {
      const unreadMessages = conversationData.filter(
        (msg: Message) => msg.senderId === partnerId && !msg.isRead
      );

      if (unreadMessages.length > 0) {
        const timeoutId = setTimeout(() => {
          markAsReadMutation.mutate({ conversationPartnerId: partnerId });
          socketService.markAsRead({ conversationPartnerId: partnerId });
        }, 500);

        return () => clearTimeout(timeoutId);
      }
    }
  }, [conversationData, partnerId, user?.id, markAsReadMutation]);

  // Prepare display data
  const displayName = partnerName || partnerProfile?.name || "Unknown User";
  const displayUsername =
    partnerUsername || partnerProfile?.username || "unknown";
  const displayProfilePicture =
    partnerProfilePicture || partnerProfile?.profilePicture;
  const profilePictureUrl = displayProfilePicture
    ? `${BUCKET_URL}/${displayProfilePicture}`
    : Icon;

  // Combine infinite query data with real-time messages
  const currentConversationMessages = useMemo(() => {
    if (!user?.id) return [];

    // Get all real-time messages for this conversation
    const realtimeMessages = messages.filter(
      (message) =>
        (message.senderId === partnerId && message.receiverId === user.id) ||
        (message.senderId === user.id && message.receiverId === partnerId)
    );

    // If we have fetched data from infinite query, merge it with real-time
    if (conversationData.length > 0) {
      const conversationIds = new Set(
        conversationData.map((m: Message) => m.id)
      );
      const realtimeOnly = realtimeMessages.filter(
        (msg) => !conversationIds.has(msg.id)
      );

      return [...conversationData, ...realtimeOnly].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }

    // If no fetched data yet, just return real-time messages
    return realtimeMessages.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [conversationData, messages, partnerId, user?.id]);

  return (
    <StyledChatContainer>
      <ConnectionStatus status={connectionStatus} />

      <ChatHeader
        displayName={displayName}
        displayUsername={displayUsername}
        profilePictureUrl={profilePictureUrl}
        onClose={onClose}
      />

      <MessageList
        messages={currentConversationMessages}
        currentUserId={user?.id}
        partnerTyping={partnerTyping}
        partnerName={displayName}
        messagesEndRef={messagesEndRef}
        onLoadMore={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        shouldScrollToBottom={shouldScrollToBottom}
        onScrolledToBottom={() => setShouldScrollToBottom(false)}
      />

      <MessageInput
        value={messageHandling.newMessage}
        onChange={messageHandling.handleInputChange}
        onSend={messageHandling.handleSendMessage}
        onKeyPress={messageHandling.handleKeyPress}
        disabled={false}
      />
    </StyledChatContainer>
  );
};

export default Chat;
