import React from "react";
import Feed from "./Feed";
import { useProfilePosts } from "../../hooks";
import { useParams } from "react-router-dom";

const ProfileFeed = () => {
  const { id } = useParams<{ id: string }>();
  const { data: posts = [], isLoading: loading } = useProfilePosts(id || "");

  return (
    <>
      <Feed posts={posts} loading={loading} />
    </>
  );
};
export default ProfileFeed;
