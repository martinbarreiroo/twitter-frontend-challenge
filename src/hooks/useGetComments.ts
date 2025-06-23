import { useEffect, useState } from "react";
import { useHttpRequestService } from "../service/HttpRequestService";
import { setLength, updateFeed } from "../redux/user";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { Post } from "../service";

interface UseGetCommentsProps {
  postId: string;
  refreshTrigger?: number;
}

export const useGetComments = ({
  postId,
  refreshTrigger,
}: UseGetCommentsProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const posts = useAppSelector((state) => state.user.feed);

  const dispatch = useAppDispatch();

  const service = useHttpRequestService();

  useEffect(() => {
    try {
      setLoading(true);
      setError(false);
      service.getCommentsByPostId(postId).then((res) => {
        // Only use fresh data from API, don't merge with existing posts
        const commentsOnly = res
          .filter((post: Post) => post.parentId === postId)
          .sort(
            (a: Post, b: Post) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ); // Sort by newest first
        dispatch(updateFeed(commentsOnly));
        dispatch(setLength(commentsOnly.length));
        setLoading(false);
      });
    } catch (e) {
      setError(true);
      console.log(e);
    }
  }, [postId, refreshTrigger]); // Add refreshTrigger to dependency array

  return { posts, loading, error };
};
