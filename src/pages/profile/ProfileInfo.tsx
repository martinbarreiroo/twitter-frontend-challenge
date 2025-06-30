import React from "react";
import { StyledContainer } from "../../components/common/Container";
import Avatar from "../../components/common/avatar/Avatar";
import Icon from "../../assets/icon.jpg";
import { StyledH5, StyledP } from "../../components/common/text";

interface ProfileInfoContainerProps {
  name?: string;
  username: string;
  profilePicture?: string;
}

const BUCKET_URL = process.env.REACT_APP_BUCKET_URL;

const ProfileInfo = ({
  name,
  username,
  profilePicture,
}: ProfileInfoContainerProps) => {
  // Construct the full URL for the profile picture if it exists and BUCKET_URL is available
  const fullProfilePictureUrl =
    profilePicture && BUCKET_URL ? `${BUCKET_URL}/${profilePicture}` : null;

  // Always ensure we have a valid src string
  const avatarSrc = fullProfilePictureUrl || Icon;

  console.log("Profile picture URL:", fullProfilePictureUrl);
  console.log("BUCKET_URL:", BUCKET_URL);
  console.log("Original profilePicture:", profilePicture);
  console.log("Final avatar src:", avatarSrc);

  return (
    <StyledContainer gap={"32px"} flex={2} flexDirection={"row"}>
      <Avatar
        src={avatarSrc}
        width={"133px"}
        height={"133px"}
        alt={name ?? "Name"}
      />
      <StyledContainer justifyContent={"center"}>
        <StyledH5>{name ?? "Name"}</StyledH5>
        <StyledP primary={false}>{`@${username}`}</StyledP>
        <StyledP primary={false}>Description...</StyledP>
      </StyledContainer>
    </StyledContainer>
  );
};
export default ProfileInfo;
