import { useEffect, useState } from "react";
import { useCurrentUser } from "./useUser";
import socketService from "../service/socketService";

export const useSocketConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "connecting" | "disconnected"
  >("disconnected");
  const { data: user } = useCurrentUser();

  useEffect(() => {
    const initializeSocket = async () => {
      const token = localStorage.getItem("token");
      if (!token || !user?.id) {
        setIsConnected(false);
        setConnectionStatus("disconnected");
        return;
      }

      try {
        setConnectionStatus("connecting");
        // Strip "Bearer " prefix from token for socket authentication
        const rawToken = token.startsWith("Bearer ")
          ? token.substring(7)
          : token;
        await socketService.connect(rawToken);
        setIsConnected(true);
        setConnectionStatus("connected");
      } catch (error) {
        console.error("Failed to connect to socket:", error);
        setIsConnected(false);
        setConnectionStatus("disconnected");
      }
    };

    if (user?.id) {
      initializeSocket();
    }

    return () => {
      if (isConnected) {
        socketService.disconnect();
        setIsConnected(false);
        setConnectionStatus("disconnected");
      }
    };
  }, [user?.id]);

  return {
    isConnected,
    connectionStatus,
    connect: async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          setConnectionStatus("connecting");
          // Strip "Bearer " prefix from token for socket authentication
          const rawToken = token.startsWith("Bearer ")
            ? token.substring(7)
            : token;
          await socketService.connect(rawToken);
          setIsConnected(true);
          setConnectionStatus("connected");
        } catch (error) {
          setIsConnected(false);
          setConnectionStatus("disconnected");
          throw error;
        }
      }
    },
    disconnect: () => {
      socketService.disconnect();
      setIsConnected(false);
      setConnectionStatus("disconnected");
    },
  };
};
