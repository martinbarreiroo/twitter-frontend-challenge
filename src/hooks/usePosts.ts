import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { useHttpRequestService } from "../service/HttpRequestService";
import { PostData, CommentData } from "../service";
import { queryKeys } from "./query-keys";
import { useToast } from "../contexts/ToastContext";

// Posts
export const useInfinitePosts = (query = "") => {
  const service = useHttpRequestService();
  return useInfiniteQuery({
    queryKey: [...queryKeys.posts, "infinite", query],
    queryFn: ({ pageParam = "" }) =>
      service.getPaginatedPosts(10, pageParam, query),
    getNextPageParam: (lastPage) => {
      // Use the last post's createdAt as the cursor for the next page
      if (lastPage && lastPage.length === 10) {
        const lastPost = lastPage[lastPage.length - 1];
        return lastPost.createdAt;
      }
      return undefined;
    },
    initialPageParam: "",
  });
};

export const usePost = (postId: string) => {
  const service = useHttpRequestService();
  return useQuery({
    queryKey: queryKeys.post(postId),
    queryFn: () => service.getPostById(postId),
    enabled: !!postId,
  });
};

export const useCreatePost = () => {
  const service = useHttpRequestService();
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (data: PostData) => service.createPost(data),
    onSuccess: () => {
      // Invalidate both regular and infinite posts queries to refetch them
      queryClient.invalidateQueries({ queryKey: queryKeys.posts });
      showSuccess("Your tweet was posted successfully!");
    },
    onError: (error: any) => {
      showError("Failed to post tweet. Please try again.");
    },
  });
};

export const useDeletePost = () => {
  const service = useHttpRequestService();
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (postId: string) => service.deletePost(postId),
    onSuccess: () => {
      // Invalidate both regular and infinite posts queries to refetch them
      queryClient.invalidateQueries({ queryKey: queryKeys.posts });
      showSuccess("Tweet deleted successfully!");
    },
    onError: (error: any) => {
      showError("Failed to delete tweet. Please try again.");
    },
  });
};

export const useInfiniteComments = (query = "") => {
  const service = useHttpRequestService();
  return useInfiniteQuery({
    queryKey: [...queryKeys.comments(query), "infinite", query],
    queryFn: ({ pageParam = "" }) =>
      service.getPaginatedCommentsByPostId(query, 10, pageParam),
    getNextPageParam: (lastPage) => {
      // Use the last comment's createdAt as the cursor for the next page
      if (lastPage && lastPage.length === 10) {
        const lastPost = lastPage[lastPage.length - 1];
        return lastPost.createdAt;
      }
      return undefined;
    },
    initialPageParam: "",
  });
};

export const useCreateComment = () => {
  const service = useHttpRequestService();
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ postId, data }: { postId: string; data: CommentData }) =>
      service.createComment(postId, data),
    onSuccess: (_, { postId }) => {
      // Invalidate comments for this post
      queryClient.invalidateQueries({ queryKey: queryKeys.comments(postId) });
      // Also invalidate the post itself to update comment count
      queryClient.invalidateQueries({ queryKey: queryKeys.post(postId) });
      // Invalidate both regular and infinite posts list to update comment counts there too
      queryClient.invalidateQueries({ queryKey: queryKeys.posts });
      showSuccess("Comment posted successfully!");
    },
    onError: (error: any) => {
      showError("Failed to post comment. Please try again.");
    },
  });
};

// Reactions
export const useCreateReaction = () => {
  const service = useHttpRequestService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, reaction }: { postId: string; reaction: string }) =>
      service.createReaction(postId, reaction),
    onSuccess: (_, { postId }) => {
      // Invalidate the specific post and both regular and infinite posts list
      queryClient.invalidateQueries({ queryKey: queryKeys.post(postId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts });
    },
  });
};

export const useDeleteReaction = () => {
  const service = useHttpRequestService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, type }: { postId: string; type: string }) =>
      service.deleteReactionByPost(postId, type),
    onSuccess: (_, { postId }) => {
      // Invalidate the specific post and both regular and infinite posts list
      queryClient.invalidateQueries({ queryKey: queryKeys.post(postId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts });
    },
  });
};
