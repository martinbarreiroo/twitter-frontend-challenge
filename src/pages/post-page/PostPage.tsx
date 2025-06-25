import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { StyledContainer } from "../../components/common/Container";
import Tweet from "../../components/tweet/Tweet";
import Loader from "../../components/loader/Loader";
import { useHttpRequestService } from "../../service/HttpRequestService";
import TweetBox from "../../components/tweet-box/TweetBox";
import { StyledH5 } from "../../components/common/text";
import { StyledFeedContainer } from "../home-page/components/contentContainer/FeedContainer";
import CommentFeed from "../../components/feed/CommentFeed";
import { Post } from "../../service";

const PostPage = () => {
  const { id: postId } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | undefined>(undefined);
  const [refreshComments, setRefreshComments] = useState<number>(0);
  const service = useHttpRequestService();

  const fetchPost = async (): Promise<void> => {
    if (!postId) return;

    try {
      const res: Post = await service.getPostById(postId);
      setPost(res);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [postId]); // This will re-run when postId changes

  const handleCommentCreated = (): void => {
    // Trigger comment refresh by updating the refreshComments counter
    setRefreshComments((prev: number) => prev + 1);
  };

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
