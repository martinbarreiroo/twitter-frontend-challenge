import React from "react";
import InfiniteFeed from "./InfiniteFeed";
import { useInfinitePosts } from "../../hooks";
import { useFeedQuery } from "../../pages/home-page/components/header/tab-bar/TabBar";
import { Post } from "../../service";

interface ContentFeedProps {
  query?: string;
}

const ContentFeed: React.FC<ContentFeedProps> = ({ query: propQuery }) => {
  const { query: contextQuery } = useFeedQuery();
  const finalQuery = propQuery ?? contextQuery;

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfinitePosts(finalQuery);

  const posts: Post[] = data?.pages.flatMap((page) => page || []) || [];

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
export default ContentFeed;
