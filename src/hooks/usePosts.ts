import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useHttpRequestService } from "../service/HttpRequestService";
import { PostData, CommentData } from "../service";
import { queryKeys } from "./query-keys";

// Posts
export const usePosts = (query = "") => {
  const service = useHttpRequestService();
  return useQuery({
    queryKey: [...queryKeys.posts, query],
    queryFn: () => service.getPosts(query),
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

  return useMutation({
    mutationFn: (data: PostData) => service.createPost(data),
    onSuccess: () => {
      // Invalidate posts queries to refetch them
      queryClient.invalidateQueries({ queryKey: queryKeys.posts });
    },
  });
};

export const useDeletePost = () => {
  const service = useHttpRequestService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => service.deletePost(postId),
    onSuccess: () => {
      // Invalidate posts queries to refetch them
      queryClient.invalidateQueries({ queryKey: queryKeys.posts });
    },
  });
};

// Comments
export const useComments = (postId: string) => {
  const service = useHttpRequestService();
  return useQuery({
    queryKey: queryKeys.comments(postId),
    queryFn: () => service.getCommentsByPostId(postId),
    enabled: !!postId,
  });
};

export const useCreateComment = () => {
  const service = useHttpRequestService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, data }: { postId: string; data: CommentData }) =>
      service.createComment(postId, data),
    onSuccess: (_, { postId }) => {
      // Invalidate comments for this post
      queryClient.invalidateQueries({ queryKey: queryKeys.comments(postId) });
      // Also invalidate the post itself to update comment count
      queryClient.invalidateQueries({ queryKey: queryKeys.post(postId) });
      // Invalidate posts list to update comment counts there too
      queryClient.invalidateQueries({ queryKey: queryKeys.posts });
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
      // Invalidate the specific post and posts list
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
      // Invalidate the specific post and posts list
      queryClient.invalidateQueries({ queryKey: queryKeys.post(postId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts });
    },
  });
};
