import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useHttpRequestService } from "../service/HttpRequestService";
import { queryKeys } from "./query-keys";
import { useToast } from "../contexts/ToastContext";

// User
export const useCurrentUser = () => {
  const service = useHttpRequestService();
  const token = localStorage.getItem("token");

  return useQuery({
    queryKey: queryKeys.user,
    queryFn: () => service.me(),
    enabled: !!token, // Only fetch when there's a token
  });
};

export const useProfile = (userId: string) => {
  const service = useHttpRequestService();
  return useQuery({
    queryKey: queryKeys.profile(userId),
    queryFn: () => service.getProfileView(userId), // Using the correct endpoint
    enabled: !!userId,
  });
};

export const useProfilePosts = (userId: string) => {
  const service = useHttpRequestService();
  return useQuery({
    queryKey: [...queryKeys.posts, "profile", userId],
    queryFn: () => service.getPostsFromProfile(userId),
    enabled: !!userId,
  });
};

// Follow/Unfollow
export const useFollowUser = () => {
  const service = useHttpRequestService();
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (userId: string) => service.followUser(userId),
    onSuccess: () => {
      // Invalidate user data and profiles
      queryClient.invalidateQueries({ queryKey: queryKeys.user });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      showSuccess("User followed successfully!");
    },
    onError: (error: any) => {
      showError("Failed to follow user. Please try again.");
    },
  });
};

export const useUnfollowUser = () => {
  const service = useHttpRequestService();
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (userId: string) => service.unfollowUser(userId),
    onSuccess: () => {
      // Invalidate user data and profiles
      queryClient.invalidateQueries({ queryKey: queryKeys.user });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      showSuccess("User unfollowed successfully!");
    },
    onError: (error: any) => {
      showError("Failed to unfollow user. Please try again.");
    },
  });
};
