import React, { useEffect, useState, ChangeEvent } from "react";
import Button from "../button/Button";
import TweetInput from "../tweet-input/TweetInput";
import { useHttpRequestService } from "../../service/HttpRequestService";
import { setLength, updateFeed } from "../../redux/user";
import ImageContainer from "../tweet/tweet-image/ImageContainer";
import { BackArrowIcon } from "../icon/Icon";
import ImageInput from "../common/ImageInput";
import { useTranslation } from "react-i18next";
import { ButtonType } from "../button/StyledButton";
import { StyledTweetBoxContainer } from "./TweetBoxContainer";
import { StyledContainer } from "../common/Container";
import { StyledButtonContainer } from "./ButtonContainer";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { User, Post } from "../../service";

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
  const [user, setUser] = useState<User | undefined>(undefined);

  const { length, query } = useSelector((state: RootState) => state.user);
  const httpService = useHttpRequestService();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const service = useHttpRequestService();

  useEffect(() => {
    handleGetUser().then((r) => setUser(r));
  }, []);

  const handleGetUser = async (): Promise<User> => {
    return await service.me();
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    setContent(e.target.value);
  };

  const handleSubmit = async (): Promise<void> => {
    try {
      setContent("");
      setImages([]);
      setImagesPreview([]);

      let result: Post | undefined;

      if (parentId) {
        let imageKeys: string[] = [];

        if (images && images.length > 0) {
          const imageRequests: ImageUploadRequest[] = images.map((file) => {
            return {
              fileExtension: file.name
                ? file.name.split(".").pop() || "jpg"
                : "jpg",
              contentType: file.type || "image/jpeg",
            };
          });

          const uploadUrlResponse: ImageUploadResponse =
            await httpService.getImageUploadUrls("comment/images/upload-urls", {
              images: imageRequests,
            });

          if (uploadUrlResponse && uploadUrlResponse.uploads) {
            // Upload each image to S3 using presigned URLs
            for (let i = 0; i < images.length; i++) {
              const file: File = images[i];
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
          content: content,
          images: imageKeys,
        };
        result = await httpService.createComment(parentId, commentData);
      } else {
        const postData = {
          content: content,
          images: images,
          parentId: parentId,
        };
        result = await httpService.createPost(postData);
      }

      if (parentId && onCommentCreated) {
        onCommentCreated();
      } else {
        dispatch(setLength(length + 1));
        const posts: Post[] = await httpService.getPosts(query);
        dispatch(updateFeed(posts));
      }

      if (close) {
        close();
      }
    } catch (e) {
      console.log(e);
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
