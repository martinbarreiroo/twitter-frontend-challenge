import React, { useState } from "react";
import ProfileInfo from "./ProfileInfo";
import { useNavigate, useParams } from "react-router-dom";
import Modal from "../../components/modal/Modal";
import { useTranslation } from "react-i18next";
import { ButtonType } from "../../components/button/StyledButton";
import {
  useProfile,
  useCurrentUser,
  useFollowUser,
  useUnfollowUser,
  useInfiniteProfilePosts,
} from "../../hooks";
import { useHttpRequestService } from "../../service/HttpRequestService";
import Button from "../../components/button/Button";
import ProfileFeed from "../../components/feed/ProfileFeed";
import { StyledContainer } from "../../components/common/Container";
import { StyledH5 } from "../../components/common/text";
import { StyledProfileFeedContainer } from "./ProfileFeedContainer";

const ProfilePage = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalValues, setModalValues] = useState({
    text: "",
    title: "",
    type: ButtonType.DEFAULT,
    buttonText: "",
  });

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const service = useHttpRequestService();

  const { data: profile, isLoading: profileLoading } = useProfile(id || "");
  const { data: user } = useCurrentUser();
  const followUserMutation = useFollowUser();
  const unfollowUserMutation = useUnfollowUser();

  if (!id) return null;

  const isOwnProfile = profile?.id === user?.id;
  const isFollowing = profile?.following || false;

  const handleButtonType = (): { component: ButtonType; text: string } => {
    if (isOwnProfile)
      return { component: ButtonType.DELETE, text: t("buttons.delete") };
    if (isFollowing)
      return { component: ButtonType.OUTLINED, text: t("buttons.unfollow") };
    else return { component: ButtonType.FOLLOW, text: t("buttons.follow") };
  };

  const handleSubmit = async () => {
    if (isOwnProfile) {
      try {
        await service.deleteProfile();
        localStorage.removeItem("token");
        navigate("/sign-in");
      } catch (error) {
        console.error("Error deleting profile:", error);
      }
    } else {
      try {
        await unfollowUserMutation.mutateAsync(profile!.id);
        setShowModal(false);
      } catch (error) {
        console.error("Error unfollowing user:", error);
      }
    }
  };

  const handleButtonAction = async () => {
    if (isOwnProfile) {
      setShowModal(true);
      setModalValues({
        title: t("modal-title.delete-account"),
        text: t("modal-content.delete-account"),
        type: ButtonType.DELETE,
        buttonText: t("buttons.delete"),
      });
    } else {
      if (isFollowing) {
        setShowModal(true);
        setModalValues({
          text: t("modal-content.unfollow"),
          title: `${t("modal-title.unfollow")} @${profile?.username}?`,
          type: ButtonType.FOLLOW,
          buttonText: t("buttons.unfollow"),
        });
      } else {
        try {
          await followUserMutation.mutateAsync(id);
        } catch (error) {
          console.error("Error following user:", error);
        }
      }
    }
  };

  if (profileLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <StyledContainer
        maxHeight={"100vh"}
        borderRight={"1px solid #ebeef0"}
        maxWidth={"600px"}
      >
        {profile && (
          <>
            <StyledContainer
              borderBottom={"1px solid #ebeef0"}
              maxHeight={"212px"}
              padding={"16px"}
            >
              <StyledContainer
                alignItems={"center"}
                padding={"24px 0 0 0"}
                flexDirection={"row"}
              >
                <ProfileInfo
                  name={profile!.name!}
                  username={profile!.username}
                  profilePicture={profile!.profilePicture}
                />
                <Button
                  buttonType={handleButtonType().component}
                  size={"100px"}
                  onClick={handleButtonAction}
                  text={handleButtonType().text}
                />
              </StyledContainer>
            </StyledContainer>
            <StyledProfileFeedContainer>
              {!profile.isPrivate || isFollowing || isOwnProfile ? (
                <ProfileFeed />
              ) : (
                <StyledH5>Private account</StyledH5>
              )}
            </StyledProfileFeedContainer>
            <Modal
              show={showModal}
              text={modalValues.text}
              title={modalValues.title}
              acceptButton={
                <Button
                  buttonType={modalValues.type}
                  text={modalValues.buttonText}
                  size={"MEDIUM"}
                  onClick={handleSubmit}
                />
              }
              onClose={() => {
                setShowModal(false);
              }}
            />
          </>
        )}
      </StyledContainer>
    </>
  );
};

export default ProfilePage;
