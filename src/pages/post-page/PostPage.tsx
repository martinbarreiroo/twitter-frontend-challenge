import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { StyledContainer } from "../../components/common/Container";
import Tweet from "../../components/tweet/Tweet";
import Loader from "../../components/loader/Loader";
import { usePost } from "../../hooks";
import TweetBox from "../../components/tweet-box/TweetBox";
import { StyledH5 } from "../../components/common/text";
import { StyledFeedContainer } from "../home-page/components/contentContainer/FeedContainer";
import CommentFeed from "../../components/feed/CommentFeed";

const PostPage = () => {
  const { id: postId } = useParams<{ id: string }>();
  const [refreshComments, setRefreshComments] = useState<number>(0);

  const { data: post, isLoading, error } = usePost(postId || "");

  const handleCommentCreated = (): void => {
    // Trigger comment refresh by updating the refreshComments counter
    setRefreshComments((prev: number) => prev + 1);
  };

  if (isLoading) return <Loader />;
  if (error || !post) return <div>Error loading post</div>;

  return (
    <StyledContainer borderRight={"1px solid #ebeef0"}>
      <StyledContainer
        padding={"16px"}
        borderBottom={"1px solid #ebeef0"}
        maxHeight={"53px"}
      >
        <StyledH5>Tweet</StyledH5>
      </StyledContainer>
      <StyledFeedContainer>
        {post ? (
          <>
            <Tweet post={post} />
            <StyledContainer
              borderBottom={"1px solid #ebeef0"}
              padding={"16px"}
            >
              <TweetBox
                parentId={postId}
                onCommentCreated={handleCommentCreated}
              />
            </StyledContainer>

            <StyledContainer minHeight={"53.5vh"}>
              <CommentFeed postId={postId} refreshTrigger={refreshComments} />
            </StyledContainer>
          </>
        ) : (
          <StyledContainer justifyContent={"center"} alignItems={"center"}>
            <Loader />
          </StyledContainer>
        )}
      </StyledFeedContainer>
    </StyledContainer>
  );
};

export default PostPage;
