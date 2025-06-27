import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Chat from "../../components/chat/Chat";
import { StyledContainer } from "../../components/common/Container";
import { useCanChat } from "../../hooks/useChats";
import Button from "../../components/button/Button";
import { ButtonType } from "../../components/button/StyledButton";
import styled from "styled-components";

const StyledChatPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 80px);
  min-height: 500px;
  padding: 12px 20px;
  width: 100%;
  max-width: 95vw;
  margin: 0 auto;
  overflow-y: auto;
`;

const StyledChatHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid ${(props) => props.theme.colors.containerLine};
`;

const StyledEmptyChat = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  border: 1px solid ${(props) => props.theme.colors.containerLine};
  border-radius: 16px;
  background: ${(props) => props.theme.background};
  gap: 16px;

  p {
    color: ${(props) => props.theme.colors.placeholder};
    text-align: center;
    margin: 0;
  }
`;

const DedicatedChatPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { data: canChatData } = useCanChat(userId || "");

  const handleBackToMessages = () => {
    navigate("/messages");
  };

  if (!userId) {
    return (
      <StyledContainer maxWidth="100%" margin="0 auto">
        <StyledChatPageContainer>
          <StyledEmptyChat>
            <p>No chat selected</p>
            <Button
              text="Back to Messages"
              buttonType={ButtonType.OUTLINED}
              size="SMALL"
              onClick={handleBackToMessages}
            />
          </StyledEmptyChat>
        </StyledChatPageContainer>
      </StyledContainer>
    );
  }

  // Check if user can chat with selected participant
  const canChat = !userId || canChatData?.canChat !== false;

  return (
    <StyledContainer maxWidth="100%" margin="0 auto">
      <StyledChatPageContainer>
        <StyledChatHeader>
          <Button
            text="← Back"
            buttonType={ButtonType.OUTLINED}
            size="SMALL"
            onClick={handleBackToMessages}
          />
        </StyledChatHeader>

        {canChat ? (
          <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
            <Chat partnerId={userId} onClose={handleBackToMessages} />
          </div>
        ) : (
          <StyledEmptyChat>
            <p>You cannot chat with this user</p>
            <p>Both users must follow each other to send messages</p>
            <Button
              text="Back to Messages"
              buttonType={ButtonType.OUTLINED}
              size="SMALL"
              onClick={handleBackToMessages}
            />
          </StyledEmptyChat>
        )}
      </StyledChatPageContainer>
    </StyledContainer>
  );
};

export default DedicatedChatPage;
