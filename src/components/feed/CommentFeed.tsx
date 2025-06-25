import React from "react";
import Feed from "./Feed";
import { useComments } from "../../hooks";

interface CommentFeedProps {
  postId: string | undefined;
  refreshTrigger?: number;
}

const CommentFeed = ({ postId, refreshTrigger }: CommentFeedProps) => {
  const { data: posts = [], isLoading: loading } = useComments(postId || "");

  return (
    <>
      <Feed posts={posts} loading={loading} />
    </>
  );
};
export default CommentFeed;
