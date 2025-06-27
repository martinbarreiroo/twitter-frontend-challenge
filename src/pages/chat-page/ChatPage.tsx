// DEPRECATED: This file is obsolete and has been replaced by:
// - MessagesPage.tsx (for the conversations list at /messages)
// - DedicatedChatPage.tsx (for individual chats at /chat/:userId)
// This file can be safely removed in a future cleanup.

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ChatList from "../../components/chat/ChatList";
import Chat from "../../components/chat/Chat";
import { StyledContainer } from "../../components/common/Container";
import { useCurrentUser } from "../../hooks/useUser";
import { useCanChat } from "../../hooks/useChats";
import { useQueryClient } from "@tanstack/react-query";
import styled from "styled-components";

const StyledChatPageContainer = styled.div`
  display: flex;
  height: 100vh;
  max-height: 600px;
  gap: 16px;
  padding: 16px;
`;

const StyledChatListSection = styled.div`
  flex: 1;
  min-width: 300px;
  max-width: 400px;
`;

const StyledChatSection = styled.div`
  flex: 2;
  min-width: 400px;
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

const ChatPage: React.FC = () => {
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const { partnerId } = useParams<{ partnerId: string }>();
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const { data: canChatData } = useCanChat(
    selectedConversation?.participantId || ""
  );
  const queryClient = useQueryClient();

  // NOTE: This component is now obsolete - replaced by MessagesPage and DedicatedChatPage
  // Refetch conversations every time we navigate to the messages page
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["conversations"] });
  }, []); // Empty dependency array means this runs once when component mounts

  // Also refetch conversations when new messages arrive (to update last message and unread counts)
  useEffect(() => {
    const interval = setInterval(() => {
      // Periodically refresh conversations to catch any updates
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["unread-count"] });
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [queryClient]);

  // Handle URL parameter for direct chat access
  useEffect(() => {
    if (partnerId && user) {
      // Create a temporary conversation object for direct access
      setSelectedConversation({
        participantId: partnerId,
        participantName: undefined, // Will be fetched by Chat component
        participantUsername: "Loading...",
        unreadCount: 0,
      });
    }
  }, [partnerId, user]);

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    // Update URL without reloading
    navigate(`/chat/${conversation.participantId}`, { replace: true });
  };

  const handleCloseChat = () => {
    setSelectedConversation(null);
    navigate("/messages", { replace: true });
  };

  // Check if user can chat with selected participant
  const canChat = !selectedConversation || canChatData?.canChat !== false;

  return (
    <StyledContainer maxWidth="1200px" margin="0 auto">
      <StyledChatPageContainer>
        <StyledChatListSection>
          <ChatList onConversationSelect={handleConversationSelect} />
        </StyledChatListSection>

        <StyledChatSection>
          {selectedConversation ? (
            canChat ? (
              <Chat
                partnerId={selectedConversation.participantId}
                partnerName={selectedConversation.participantName}
                partnerUsername={selectedConversation.participantUsername}
                partnerProfilePicture={
                  selectedConversation.participantProfilePicture
                }
                onClose={handleCloseChat}
              />
            ) : (
              <StyledEmptyChat>
                <p>You cannot chat with this user</p>
                <p>Both users must follow each other to send messages</p>
              </StyledEmptyChat>
            )
          ) : (
            <StyledEmptyChat>
              <p>Select a conversation to start chatting</p>
              <p>Your messages will appear here</p>
            </StyledEmptyChat>
          )}
        </StyledChatSection>
      </StyledChatPageContainer>
    </StyledContainer>
  );
};

export default ChatPage;
