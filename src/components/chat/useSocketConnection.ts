import { useEffect, useState, useCallback } from "react";
import socketService, { Message } from "../../service/socketService";

interface UseSocketConnectionProps {
  partnerId: string;
  currentUserId?: string;
  onMessageReceived: (message: Message) => void;
  onTypingUpdate: (isTyping: boolean) => void;
  onMessagesMarkedAsRead: () => void;
}

export const useSocketConnection = ({
  partnerId,
  currentUserId,
  onMessageReceived,
  onTypingUpdate,
  onMessagesMarkedAsRead,
}: UseSocketConnectionProps) => {
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "connecting" | "disconnected"
  >("disconnected");

  // Monitor socket connection status
  useEffect(() => {
    const checkConnectionStatus = () => {
      const status = socketService.getConnectionStatus();
      setConnectionStatus(status);
    };

    checkConnectionStatus();
    const interval = setInterval(checkConnectionStatus, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [currentUserId]);

  // Subscribe to real-time messages
  useEffect(() => {
    if (!currentUserId || !partnerId) return;

    const currentPartnerId = partnerId;

    const setupSubscriptions = () => {
      const unsubscribeMessages = socketService.subscribeToMessages(
        (message: Message) => {
          if (
            message.senderId === currentPartnerId ||
            message.receiverId === currentPartnerId
          ) {
            onMessageReceived(message);
          }
        }
      );

      const unsubscribeTyping = socketService.subscribeToTyping(
        ({ userId, isTyping }) => {
          if (userId === currentPartnerId) {
            onTypingUpdate(isTyping);
          }
        }
      );

      const unsubscribeMarkedAsRead =
        socketService.subscribeToMessagesMarkedAsRead(({ userId }) => {
          if (userId === currentPartnerId) {
            onMessagesMarkedAsRead();
          }
        });

      return () => {
        unsubscribeMessages();
        unsubscribeTyping();
        unsubscribeMarkedAsRead();
      };
    };

    let cleanup: (() => void) | undefined;
    if (socketService.isConnected()) {
      cleanup = setupSubscriptions();
    }

    const connectionCheckInterval = setInterval(() => {
      const isConnected = socketService.isConnected();
      if (isConnected && !cleanup) {
        cleanup = setupSubscriptions();
      } else if (!isConnected && cleanup) {
        cleanup();
        cleanup = undefined;
      }
    }, 1000);

    return () => {
      clearInterval(connectionCheckInterval);
      if (cleanup) {
        cleanup();
      }
    };
  }, [
    partnerId,
    currentUserId,
    onMessageReceived,
    onTypingUpdate,
    onMessagesMarkedAsRead,
  ]);

  return {
    connectionStatus,
    isConnected: socketService.isConnected(),
  };
};
