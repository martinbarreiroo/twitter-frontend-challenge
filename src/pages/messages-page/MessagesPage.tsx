import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ChatList from "../../components/chat/ChatList";
import { StyledContainer } from "../../components/common/Container";
import { StyledH5 } from "../../components/common/text";
import { useQueryClient } from "@tanstack/react-query";
import styled from "styled-components";

const StyledMessagesPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 80px);
  min-height: 600px;
  padding: 12px 20px;
  width: 100%;
  max-width: 95vw;
  margin: 0 auto;
  overflow-y: auto;
`;

const StyledMessagesHeader = styled.div`
  padding: 16px 0;
  border-bottom: 1px solid ${(props) => props.theme.colors.containerLine};
  margin-bottom: 16px;
`;

interface Conversation {
  participantId: string;
  participantName?: string;
  participantUsername: string;
  participantProfilePicture?: string;
  lastMessage?: {
    id: string;
    content: string;
    createdAt: string;
    senderId: string;
  };
  unreadCount: number;
}

const MessagesPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Refetch conversations every time we navigate to the messages page
  useEffect(() => {
    console.log("MessagesPage mounted, invalidating conversations");
    queryClient.invalidateQueries({ queryKey: ["conversations"] });
    // Also invalidate individual conversation queries to ensure fresh data
    queryClient.invalidateQueries({ queryKey: ["conversation"] });
  }, [queryClient]);

  // Also refetch conversations periodically to catch any updates
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["unread-count"] });
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [queryClient]);

  // Also refresh data when user returns to the window/tab
  useEffect(() => {
    const handleWindowFocus = () => {
      console.log(
        "Window focused, refreshing conversations and individual chats"
      );
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["conversation"] });
    };

    window.addEventListener("focus", handleWindowFocus);
    return () => {
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [queryClient]);

  const handleConversationSelect = (conversation: Conversation) => {
    // Navigate to dedicated chat page
    navigate(`/chat/${conversation.participantId}`);
  };

  return (
    <StyledContainer maxWidth="100%" margin="0 auto">
      <StyledMessagesPageContainer>
        <StyledMessagesHeader>
          <StyledH5>Messages</StyledH5>
        </StyledMessagesHeader>

        <div style={{ flex: 1, overflow: "auto", minHeight: 0 }}>
          <ChatList onConversationSelect={handleConversationSelect} />
        </div>
      </StyledMessagesPageContainer>
    </StyledContainer>
  );
};

export default MessagesPage;
