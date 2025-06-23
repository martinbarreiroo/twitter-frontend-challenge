import React, { useEffect, useState } from "react";
import { StyledTweetContainer } from "./TweetContainer";
import AuthorData from "./user-post-data/AuthorData";
import type { Post, User } from "../../service";
import { StyledReactionsContainer } from "./ReactionsContainer";
import Reaction from "./reaction/Reaction";
import { useHttpRequestService } from "../../service/HttpRequestService";
import { IconType } from "../icon/Icon";
import { StyledContainer } from "../common/Container";
import ThreeDots from "../common/ThreeDots";
import DeletePostModal from "./delete-post-modal/DeletePostModal";
import ImageContainer from "./tweet-image/ImageContainer";
import CommentModal from "../comment/comment-modal/CommentModal";
import { useNavigate } from "react-router-dom";

interface TweetProps {
  post: Post;
}

const Tweet = ({ post }: TweetProps) => {
  const [actualPost, setActualPost] = useState<Post>(post);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showCommentModal, setShowCommentModal] = useState<boolean>(false);
  const service = useHttpRequestService();
  const navigate = useNavigate();
  const [user, setUser] = useState<User>();

  useEffect(() => {
    handleGetUser().then((r) => setUser(r));
  }, []);

  useEffect(() => {
    setActualPost(post);
  }, [post]);

  const handleGetUser = async () => {
    return await service.me();
  };

  const getCountByType = (type: string): number => {
    switch (type) {
      case "LIKE":
        return actualPost?.qtyLikes ?? 0;
      case "RETWEET":
        return actualPost?.qtyRetweets ?? 0;
      case "COMMENT":
        return actualPost?.qtyComments ?? 0;
      default:
        return 0;
    }
  };

  const handleReaction = async (type: string) => {
    try {
      const hasReacted = hasReactedByType(type);

      if (hasReacted) {
        // User has already reacted, so remove the specific reaction type
        await service.deleteReactionByPost(actualPost.id, type.toLowerCase());
      } else {
        // User hasn't reacted, so create new reaction
        await service.createReaction(actualPost.id, type.toLowerCase());
      }

      // Refresh the post to get updated counts and reaction status
      const newPost = await service.getPostById(post.id);
      setActualPost(newPost);
    } catch (error) {
      console.error("Error handling reaction:", error);
    }
  };

  const hasReactedByType = (type: string): boolean => {
    switch (type) {
      case "LIKE":
        return actualPost?.hasLiked ?? false;
      case "RETWEET":
        return actualPost?.hasRetweeted ?? false;
      default:
        return false;
    }
  };

  return (
    <StyledTweetContainer>
      <StyledContainer
        style={{ width: "100%" }}
        flexDirection={"row"}
        alignItems={"center"}
        justifyContent={"center"}
        maxHeight={"48px"}
      >
        <AuthorData
          id={post.author.id}
          name={post.author.name ?? "Name"}
          username={post.author.username}
          createdAt={post.createdAt}
          profilePicture={post.author.profilePicture}
        />
        {post.authorId === user?.id && (
          <>
            <DeletePostModal
              show={showDeleteModal}
              id={post.id}
              onClose={() => {
                setShowDeleteModal(false);
              }}
            />
            <ThreeDots
              onClick={() => {
                setShowDeleteModal(!showDeleteModal);
              }}
            />
          </>
        )}
      </StyledContainer>
      <StyledContainer onClick={() => navigate(`/post/${post.id}`)}>
        <p>{post.content}</p>
      </StyledContainer>
      {post.images && post.images!.length > 0 && (
        <StyledContainer padding={"0 0 0 10%"}>
          <ImageContainer images={post.images} />
        </StyledContainer>
      )}
      <StyledReactionsContainer>
        <Reaction
          img={IconType.CHAT}
          count={getCountByType("COMMENT")}
          reactionFunction={() =>
            window.innerWidth > 600
              ? setShowCommentModal(true)
              : navigate(`/compose/comment/${post.id}`)
          }
          increment={0}
          reacted={false}
        />
        <Reaction
          img={IconType.RETWEET}
          count={getCountByType("RETWEET")}
          reactionFunction={() => handleReaction("RETWEET")}
          increment={1}
          reacted={hasReactedByType("RETWEET")}
        />
        <Reaction
          img={IconType.LIKE}
          count={getCountByType("LIKE")}
          reactionFunction={() => handleReaction("LIKE")}
          increment={1}
          reacted={hasReactedByType("LIKE")}
        />
      </StyledReactionsContainer>
      <CommentModal
        show={showCommentModal}
        post={post}
        onClose={() => setShowCommentModal(false)}
      />
    </StyledTweetContainer>
  );
};

export default Tweet;
