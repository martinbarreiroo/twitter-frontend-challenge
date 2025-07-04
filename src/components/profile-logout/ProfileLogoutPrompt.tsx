import LogoutPrompt from "../navbar/logout-prompt/LogoutPrompt";
import {
  StyledLogoutPrompt,
  StyledProfileLogoutPromptContainer,
} from "./StyledProfileLogoutPromptContainer";
import React, { useState } from "react";
import icon from "../../assets/icon.jpg";
import { StyledP } from "../common/text";
import { StyledContainer } from "../common/Container";
import { useAuth } from "../../contexts/AuthContext";
import { useClickOutside } from "../../hooks";

interface ProfileLogoutPromptProps {
  margin: string;
  direction: string;
}

const ProfileLogoutPrompt = ({
  margin,
  direction,
}: ProfileLogoutPromptProps) => {
  const [logoutOpen, setLogoutOpen] = useState(false);
  const { user } = useAuth();

  // Use click outside hook to close the logout menu
  const logoutRef = useClickOutside<HTMLDivElement>(() => {
    if (logoutOpen) {
      setLogoutOpen(false);
    }
  });

  const handleLogout = () => {
    setLogoutOpen(!logoutOpen);
  };

  const handleButtonClick = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  const fullSrc =
    user?.profilePicture && process.env.REACT_APP_BUCKET_URL
      ? `${process.env.REACT_APP_BUCKET_URL}/${user.profilePicture}`
      : user?.profilePicture || icon;

  return (
    <StyledContainer
      ref={logoutRef}
      maxHeight={"48px"}
      flexDirection={"row"}
      className={"profile-info"}
      alignItems={"center"}
      gap={"8px"}
      onClick={handleLogout}
      cursor={"pointer"}
    >
      <StyledProfileLogoutPromptContainer direction={direction}>
        <img src={fullSrc} className="icon" alt="Icon" />
        {logoutOpen && (
          <StyledLogoutPrompt
            margin={margin}
            onClick={(event) => handleButtonClick(event)}
          >
            <LogoutPrompt show={logoutOpen} />
          </StyledLogoutPrompt>
        )}
      </StyledProfileLogoutPromptContainer>
      <StyledContainer padding={"4px 0"} gap={"4px"} className={"user-info"}>
        <StyledP primary>{user?.name}</StyledP>
        <StyledP primary={false}>{`@${user?.username}`}</StyledP>
      </StyledContainer>
    </StyledContainer>
  );
};

export default ProfileLogoutPrompt;
