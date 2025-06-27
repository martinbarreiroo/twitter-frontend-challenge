import React from "react";
import InfiniteFeed from "./InfiniteFeed";
import { useInfiniteProfilePosts } from "../../hooks";
import { useParams } from "react-router-dom";

const ProfileFeed = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteProfilePosts(id || "");

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
export default ProfileFeed;
