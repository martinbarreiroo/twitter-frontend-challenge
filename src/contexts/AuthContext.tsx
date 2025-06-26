import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useHttpRequestService } from "../service/HttpRequestService";
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
      } else {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem("token");
        // Clear React Query cache when not authenticated
        queryClient.removeQueries({ queryKey: queryKeys.user });
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem("token");
      // Clear React Query cache on error
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
    // Clear all React Query cache on logout
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
