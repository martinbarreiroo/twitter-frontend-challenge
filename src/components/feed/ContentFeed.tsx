import React from "react";
import Feed from "./Feed";
import { usePosts } from "../../hooks";
import { useFeedQuery } from "../../pages/home-page/components/header/tab-bar/TabBar";

interface ContentFeedProps {
  query?: string;
}

const ContentFeed: React.FC<ContentFeedProps> = ({ query: propQuery }) => {
  const { query: contextQuery } = useFeedQuery();
  const finalQuery = propQuery ?? contextQuery;
  const { data: posts = [], isLoading: loading } = usePosts(finalQuery);

  return <Feed posts={posts} loading={loading} />;
};
export default ContentFeed;
