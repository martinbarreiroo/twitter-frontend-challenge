import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useHttpRequestService } from "../service/HttpRequestService";
import { queryKeys } from "./query-keys";

// User
export const useCurrentUser = () => {
  const service = useHttpRequestService();
  return useQuery({
    queryKey: queryKeys.user,
    queryFn: () => service.me(),
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

  return useMutation({
    mutationFn: (userId: string) => service.followUser(userId),
    onSuccess: () => {
      // Invalidate user data and profiles
      queryClient.invalidateQueries({ queryKey: queryKeys.user });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};

export const useUnfollowUser = () => {
  const service = useHttpRequestService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => service.unfollowUser(userId),
    onSuccess: () => {
      // Invalidate user data and profiles
      queryClient.invalidateQueries({ queryKey: queryKeys.user });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};
