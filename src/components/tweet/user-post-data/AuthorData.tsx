import React from "react";
import { StyledAuthorDataContainer } from "./AuthorDataContainer";
import Avatar from "../../common/avatar/Avatar";
import Icon from "../../../assets/icon.jpg";
import { StyledDot } from "../../common/Dot";
import { useNavigate } from "react-router-dom";

interface UserPostDataProps {
  createdAt: Date;
  id: string;
  name: string;
  username: string;
  profilePicture?: string;
}
const AuthorData = ({
  createdAt,
  id,
  username,
  name,
  profilePicture,
}: UserPostDataProps) => {
  const navigate = useNavigate();

  const redirectToProfile = () => {
    navigate(`/profile/${id}`);
  };

  const BUCKET_URL = process.env.REACT_APP_BUCKET_URL;
  // Construct the full URL for the profile picture if it exists and BUCKET_URL is available
  const fullProfilePictureUrl =
    profilePicture && BUCKET_URL ? `${BUCKET_URL}/${profilePicture}` : null;

  return (
    <StyledAuthorDataContainer>
      <Avatar
        src={fullProfilePictureUrl === null ? Icon : fullProfilePictureUrl}
        alt={name}
        onClick={redirectToProfile}
      />
      <p>{name}</p>
      <p className={"username"}>{"@" + username}</p>
      <StyledDot />
      <p className={"username"}>
        {new Date(createdAt).toLocaleString("default", {
          month: "short",
          day: "numeric",
        })}
      </p>
    </StyledAuthorDataContainer>
  );
};

export default AuthorData;
