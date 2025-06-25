import React, { useState, ChangeEvent } from "react";
import Button from "../button/Button";
import TweetInput from "../tweet-input/TweetInput";
import { useHttpRequestService } from "../../service/HttpRequestService";
import { useCreatePost, useCreateComment, useCurrentUser } from "../../hooks";
import ImageContainer from "../tweet/tweet-image/ImageContainer";
import { BackArrowIcon } from "../icon/Icon";
import ImageInput from "../common/ImageInput";
import { useTranslation } from "react-i18next";
import { ButtonType } from "../button/StyledButton";
import { StyledTweetBoxContainer } from "./TweetBoxContainer";
import { StyledContainer } from "../common/Container";
import { StyledButtonContainer } from "./ButtonContainer";

interface TweetBoxProps {
  parentId?: string;
  close?: () => void;
  mobile?: boolean;
  onCommentCreated?: () => void;
  borderless?: boolean;
}

interface ImageUploadRequest {
  fileExtension: string;
  contentType: string;
}

interface ImageUploadResponse {
  uploads: Array<{
    uploadUrl: string;
    imageKey: string;
  }>;
}

interface ImageUploadRequest {
  fileExtension: string;
  contentType: string;
}

interface ImageUploadResponse {
  uploads: Array<{
    uploadUrl: string;
    imageKey: string;
  }>;
}

const TweetBox: React.FC<TweetBoxProps> = ({
  parentId,
  close,
  mobile,
  onCommentCreated,
  borderless,
}) => {
  const [content, setContent] = useState<string>("");
  const [images, setImages] = useState<File[]>([]);
  const [imagesPreview, setImagesPreview] = useState<string[]>([]);

  const { data: user } = useCurrentUser();
  const createPostMutation = useCreatePost();
  const createCommentMutation = useCreateComment();
  const httpService = useHttpRequestService();
  const { t } = useTranslation();

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    setContent(e.target.value);
  };

  const handleSubmit = async (): Promise<void> => {
    try {
      const originalContent = content;
      const originalImages = images;

      // Reset form immediately for better UX
      setContent("");
      setImages([]);
      setImagesPreview([]);

      if (parentId) {
        // Handle comment creation
        let imageKeys: string[] = [];

        if (originalImages && originalImages.length > 0) {
          const imageRequests: ImageUploadRequest[] = originalImages.map(
            (file) => {
              return {
                fileExtension: file.name
                  ? file.name.split(".").pop() || "jpg"
                  : "jpg",
                contentType: file.type || "image/jpeg",
              };
            }
          );

          const uploadUrlResponse: ImageUploadResponse =
            await httpService.getImageUploadUrls("comment/images/upload-urls", {
              images: imageRequests,
            });

          if (uploadUrlResponse && uploadUrlResponse.uploads) {
            for (let i = 0; i < originalImages.length; i++) {
              const file: File = originalImages[i];
              const uploadInfo = uploadUrlResponse.uploads[i];

              if (
                !uploadInfo ||
                !uploadInfo.uploadUrl ||
                !uploadInfo.imageKey
              ) {
                throw new Error(`Invalid upload data for image ${i + 1}`);
              }

              const { uploadUrl, imageKey } = uploadInfo;

              const uploadResponse = await fetch(uploadUrl, {
                method: "PUT",
                body: file,
              });

              if (!uploadResponse.ok) {
                throw new Error(`Failed to upload image ${i + 1}`);
              }

              imageKeys.push(imageKey);
            }
          }
        }

        const commentData = {
          content: originalContent,
          images: imageKeys,
        };

        await createCommentMutation.mutateAsync({
          postId: parentId,
          data: commentData,
        });

        if (onCommentCreated) {
          onCommentCreated();
        }
      } else {
        // Handle post creation
        const postData = {
          content: originalContent,
          images: originalImages,
          parentId: parentId,
        };

        await createPostMutation.mutateAsync(postData);
      }

      if (close) {
        close();
      }
    } catch (e) {
      console.log(e);
      // Restore form content if there was an error
      // You might want to add proper error handling/toast notifications here
    }
  };

  const handleRemoveImage = (index: number): void => {
    const newImages = images.filter((i, idx) => idx !== index);
    const newImagesPreview = newImages.map((i) => URL.createObjectURL(i));
    setImages(newImages);
    setImagesPreview(newImagesPreview);
  };

  const handleAddImage = (newImages: File[]): void => {
    setImages(newImages);
    const newImagesPreview = newImages.map((i) => URL.createObjectURL(i));
    setImagesPreview(newImagesPreview);
  };

  return (
    <StyledTweetBoxContainer>
      {mobile && (
        <StyledContainer
          flexDirection={"row"}
          justifyContent={"space-between"}
          alignItems={"center"}
        >
          <BackArrowIcon onClick={close} />
          <Button
            text={"Tweet"}
            buttonType={ButtonType.DEFAULT}
            size={"SMALL"}
            onClick={handleSubmit}
            disabled={content.length === 0}
          />
        </StyledContainer>
      )}
      <StyledContainer style={{ width: "100%" }}>
        <TweetInput
          onChange={handleChange}
          maxLength={240}
          placeholder={t("placeholder.tweet")}
          value={content}
          src={user?.profilePicture}
        />
        <StyledContainer padding={"0 0 0 10%"}>
          <ImageContainer
            editable
            images={imagesPreview}
            removeFunction={handleRemoveImage}
          />
        </StyledContainer>
        <StyledButtonContainer>
          <ImageInput setImages={handleAddImage} parentId={parentId} />
          {!mobile && (
            <Button
              text={"Tweet"}
              buttonType={ButtonType.DEFAULT}
              size={"SMALL"}
              onClick={handleSubmit}
              disabled={
                content.length <= 0 ||
                content.length > 240 ||
                images.length > 4 ||
                images.length < 0
              }
            />
          )}
        </StyledButtonContainer>
      </StyledContainer>
    </StyledTweetBoxContainer>
  );
};

export default TweetBox;
