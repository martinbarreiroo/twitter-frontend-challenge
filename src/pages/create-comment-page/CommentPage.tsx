import React, { useEffect, useState } from "react";
import { BackArrowIcon } from "../../components/icon/Icon";
import Button from "../../components/button/Button";
import { Post } from "../../service";
import AuthorData from "../../components/tweet/user-post-data/AuthorData";
import ImageContainer from "../../components/tweet/tweet-image/ImageContainer";
import { useParams } from "react-router-dom";
import { useHttpRequestService } from "../../service/HttpRequestService";
import { useCurrentUser, usePost } from "../../hooks";
import TweetInput from "../../components/tweet-input/TweetInput";
import ImageInput from "../../components/common/ImageInput";
import { useTranslation } from "react-i18next";
import { ButtonType } from "../../components/button/StyledButton";
import { StyledContainer } from "../../components/common/Container";
import { StyledLine } from "../../components/common/Line";
import { StyledP } from "../../components/common/text";

const CommentPage = () => {
  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagesPreview, setImagesPreview] = useState<string[]>([]);
  const { id: postId } = useParams<{ id: string }>();

  const { data: user } = useCurrentUser();
  const { data: post } = usePost(postId || "");
  const service = useHttpRequestService();
  const { t } = useTranslation();

  useEffect(() => {
    window.innerWidth > 600 && exit();
  }, []);

  const exit = () => {
    window.history.back();
  };

  const handleSubmit = async () => {
    if (!postId) return;

    try {
      // Create the comment using the correct endpoint
      const imageUrls = images.map((image) => URL.createObjectURL(image));
      const commentData = {
        content: content,
        images: imageUrls,
      };

      await service.createComment(postId, commentData);

      // Reset form
      setContent("");
      setImages([]);

      // Just go back - don't update the global feed
      exit();
    } catch (error) {
      console.error("Failed to create comment:", error);
    }
  };
  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((i, idx) => idx !== index);
    setImages(newImages);
  };

  return (
    <StyledContainer padding={"16px"}>
      <StyledContainer
        flexDirection={"row"}
        alignItems={"center"}
        justifyContent={"space-between"}
      >
        <BackArrowIcon onClick={exit} />
        <Button
          text={"Tweet"}
          buttonType={ButtonType.DEFAULT}
          size={"SMALL"}
          onClick={handleSubmit}
          disabled={content.length === 0}
        />
      </StyledContainer>
      {post && (
        <StyledContainer gap={"16px"}>
          <AuthorData
            id={post.authorId}
            name={post.author.name ?? "Name"}
            username={post.author.username}
            createdAt={post.createdAt}
            profilePicture={post.author.profilePicture}
          />
          <StyledContainer flexDirection={"row"}>
            <StyledLine />
            <StyledContainer gap={"8px"}>
              <StyledP primary>{post.content}</StyledP>
              {post.images && <ImageContainer images={post.images} />}
            </StyledContainer>
          </StyledContainer>
          <StyledContainer gap={"4px"}>
            <TweetInput
              maxLength={240}
              placeholder={t("placeholder.comment")}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              src={user?.profilePicture}
            />
            {images.length > 0 && (
              <ImageContainer
                editable
                images={images.map((i) => URL.createObjectURL(i))}
                removeFunction={handleRemoveImage}
              />
            )}
            <StyledContainer padding={"0 0 0 10%"}>
              <ImageInput
                setImages={setImages}
                parentId={`comment-page-${postId}`}
              />
            </StyledContainer>
          </StyledContainer>
        </StyledContainer>
      )}
    </StyledContainer>
  );
};
export default CommentPage;
