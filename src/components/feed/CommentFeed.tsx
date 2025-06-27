import InfiniteFeed from "./InfiniteFeed";
import { useInfiniteComments } from "../../hooks";
import { useParams } from "react-router-dom";

interface CommentFeedProps {
  postId: string | undefined;
  refreshTrigger?: number;
}

const CommentFeed = ({ postId, refreshTrigger }: CommentFeedProps) => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteComments(id || "");

  const posts = data?.pages.flatMap((page) => page || []) || [];

  return (
    <InfiniteFeed
      posts={posts}
      loading={isLoading}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
    />
  );
};
export default CommentFeed;
