import React from "react";
import Feed from "./Feed";
import { useGetComments } from "../../hooks/useGetComments";

interface CommentFeedProps {
  postId: string;
  refreshTrigger?: number;
}
const CommentFeed = ({ postId, refreshTrigger }: CommentFeedProps) => {
  const { posts, loading } = useGetComments({
    postId,
    refreshTrigger,
  });

  return (
    <>
      <Feed posts={posts} loading={loading} />
    </>
  );
};
export default CommentFeed;
