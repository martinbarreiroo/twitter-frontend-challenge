import Button from "../button/Button";
import { useFollowUser, useUnfollowUser, useProfile } from "../../hooks";
import UserDataBox from "../user-data-box/UserDataBox";
import { useTranslation } from "react-i18next";
import { ButtonType } from "../button/StyledButton";
import { StyledFollowUserBoxContainer } from "./StyledFollowUserBox";

interface FollowUserBoxProps {
  profilePicture?: string;
  name?: string;
  username?: string;
  id: string;
}

const FollowUserBox = ({
  profilePicture,
  name,
  username,
  id,
}: FollowUserBoxProps) => {
  const { t } = useTranslation();
  const { data: profile } = useProfile(id);
  const followUserMutation = useFollowUser();
  const unfollowUserMutation = useUnfollowUser();

  const isFollowing = profile?.following || false;

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await unfollowUserMutation.mutateAsync(id);
      } else {
        await followUserMutation.mutateAsync(id);
      }
    } catch (error) {
      console.error("Error toggling follow status:", error);
    }
  };

  return (
    <StyledFollowUserBoxContainer>
      <UserDataBox
        id={id}
        name={name!}
        profilePicture={profilePicture!}
        username={username!}
      />
      <Button
        text={isFollowing ? t("buttons.unfollow") : t("buttons.follow")}
        buttonType={isFollowing ? ButtonType.DELETE : ButtonType.FOLLOW}
        size={"SMALL"}
        onClick={handleFollow}
      />
    </StyledFollowUserBoxContainer>
  );
};

export default FollowUserBox;
