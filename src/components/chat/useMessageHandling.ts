import { useState, useCallback, useRef } from "react";
import socketService, { Message } from "../../service/socketService";
import { useHttpRequestService } from "../../service/HttpRequestService";
import { useToast } from "../../contexts/ToastContext";

interface UseMessageHandlingProps {
  partnerId: string;
  currentUserId?: string;
  onMessageSent?: () => void;
}

export const useMessageHandling = ({
  partnerId,
  currentUserId,
  onMessageSent,
}: UseMessageHandlingProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const httpService = useHttpRequestService();
  const { showError } = useToast();

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !currentUserId) return;

    const messageContent = newMessage.trim();
    setNewMessage("");

    // Try socket first, fallback to HTTP if socket not connected
    if (socketService.isConnected()) {
      socketService.sendMessage(
        partnerId,
        { content: messageContent },
        (response) => {
          if (!response.success) {
            showError(response.error || "Failed to send message");
          }
          onMessageSent?.();
        }
      );
    } else {
      // Fallback to HTTP API
      try {
        await httpService.sendMessage(partnerId, { content: messageContent });

        // Create temporary message for immediate feedback
        const tempMessage: Message = {
          id: `temp-${Date.now()}`,
          content: messageContent,
          senderId: currentUserId,
          receiverId: partnerId,
          isRead: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        onMessageSent?.();
        return tempMessage;
      } catch (error) {
        showError("Failed to send message");
      }
    }
  }, [
    newMessage,
    partnerId,
    currentUserId,
    showError,
    onMessageSent,
    httpService,
  ]);

  const handleTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      socketService.sendTypingIndicator({
        receiverId: partnerId,
        isTyping: true,
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socketService.sendTypingIndicator({
        receiverId: partnerId,
        isTyping: false,
      });
    }, 1000);
  }, [isTyping, partnerId]);

  const handleInputChange = useCallback(
    (value: string) => {
      setNewMessage(value);
      handleTyping();
    },
    [handleTyping]
  );

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  return {
    newMessage,
    setNewMessage,
    handleSendMessage,
    handleInputChange,
    handleKeyPress,
  };
};
