import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useHttpRequestService } from "../service/HttpRequestService";
import socketService from "../service/socketService";
import { User } from "../service";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../hooks/query-keys";
import { useToast } from "./ToastContext";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const service = useHttpRequestService();
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return;
      }

      const loggedIn = await service.isLogged();
      if (loggedIn) {
        // Use React Query to fetch and cache user data
        const userData = await queryClient.fetchQuery({
          queryKey: queryKeys.user,
          queryFn: () => service.me(),
        });
        setUser(userData);
        setIsAuthenticated(true);

        // Initialize socket connection for authenticated user after user data is loaded
        setTimeout(async () => {
          try {
            // Always try to connect/reconnect to ensure fresh connection after page reload
            console.log("Connecting to socket with token...");
            // Strip "Bearer " prefix from token for socket authentication
            const rawToken = token.startsWith("Bearer ")
              ? token.substring(7)
              : token;

            // Disconnect first to ensure clean connection state
            if (socketService.isConnected()) {
              console.log(
                "Disconnecting existing socket connection for fresh start"
              );
              socketService.disconnect();
            }

            await socketService.connect(rawToken);
            console.log("Socket connected successfully");
          } catch (socketError) {
            console.warn(
              "Chat service unavailable:",
              socketError instanceof Error
                ? socketError.message
                : "Unknown error"
            );
            // Don't show error to user as chat is not critical for basic functionality
            // The chat components will handle showing "disconnected" state

            // Retry connection after a delay
            setTimeout(async () => {
              try {
                console.log("Retrying socket connection...");
                const rawToken = token.startsWith("Bearer ")
                  ? token.substring(7)
                  : token;
                await socketService.connect(rawToken);
                console.log("Socket retry connection successful");
              } catch (retryError) {
                console.warn(
                  "Socket retry failed:",
                  retryError instanceof Error
                    ? retryError.message
                    : "Unknown error"
                );
              }
            }, 5000); // Retry after 5 seconds
          }
        }, 100); // Small delay to ensure user state is set
      } else {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem("token");
        // Disconnect socket and clear React Query cache when not authenticated
        socketService.disconnect();
        queryClient.removeQueries({ queryKey: queryKeys.user });
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem("token");
      // Disconnect socket and clear React Query cache on error
      socketService.disconnect();
      queryClient.removeQueries({ queryKey: queryKeys.user });
      showError("Authentication failed. Please login again.");
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (token: string) => {
    localStorage.setItem("token", token);
    await checkAuthStatus();
    showSuccess("Successfully logged in!");
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
    // Disconnect socket and clear all React Query cache on logout
    socketService.disconnect();
    queryClient.clear();
    showSuccess("Successfully logged out!");
  };

  const refreshUser = async () => {
    if (isAuthenticated) {
      try {
        // Use React Query to fetch fresh user data and update cache
        const userData = await queryClient.fetchQuery({
          queryKey: queryKeys.user,
          queryFn: () => service.me(),
        });
        setUser(userData);
      } catch (error) {
        console.error("Failed to refresh user data:", error);
        showError("Failed to refresh user data");
      }
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
