import React from "react";
import { StyledContainer } from "../common/Container";
import { StyledP, StyledH5 } from "../common/text";
import Avatar from "../common/avatar/Avatar";
import styled from "styled-components";

const StyledChatHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid ${(props) => props.theme.colors.containerLine};
  gap: 12px;
`;

interface ChatHeaderProps {
  displayName: string;
  displayUsername: string;
  profilePictureUrl: string;
  onClose?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  displayName,
  displayUsername,
  profilePictureUrl,
}) => {
  return (
    <StyledChatHeader>
      <Avatar
        src={profilePictureUrl}
        alt={displayName}
        width="40px"
        height="40px"
      />
      <StyledContainer>
        <StyledH5>{displayName}</StyledH5>
        <StyledP primary={false}>@{displayUsername}</StyledP>
      </StyledContainer>
    </StyledChatHeader>
  );
};

export default ChatHeader;
