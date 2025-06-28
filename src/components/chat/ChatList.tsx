import React from "react";
import { useConversations } from "../../hooks/useChats";
import { StyledContainer } from "../common/Container";
import { StyledP, StyledH5 } from "../common/text";
import Avatar from "../common/avatar/Avatar";
import Icon from "../../assets/icon.jpg";
import styled from "styled-components";

const StyledChatListContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid ${(props) => props.theme.colors.containerLine};
  border-radius: 16px;
  background: ${(props) => props.theme.background};
  overflow: hidden;
`;

const StyledConversationsList = styled.div`
  flex: 1;
  overflow-y: auto;
  max-height: calc(100vh - 200px);
`;

const StyledConversationItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  gap: 12px;
  cursor: pointer;
  border-bottom: 1px solid ${(props) => props.theme.colors.containerLine};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${(props) => props.theme.colors.containerLine};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const StyledConversationInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StyledLastMessage = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  p {
    margin: 0;
    font-size: 14px;
    color: ${(props) => props.theme.colors.placeholder};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 200px;
  }
`;

const StyledUnreadBadge = styled.div`
  background: ${(props) => props.theme.colors.main};
  color: white;
  border-radius: 50%;
  min-width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
`;

const StyledEmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 32px;
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

interface ChatListProps {
  onConversationSelect: (conversation: Conversation) => void;
}

const BUCKET_URL = process.env.REACT_APP_BUCKET_URL;

const ChatList: React.FC<ChatListProps> = ({ onConversationSelect }) => {
  const { data: conversations, isLoading, error } = useConversations();

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60)
      );
      return diffInMinutes === 0 ? "now" : `${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return diffInDays === 1 ? "1d" : `${diffInDays}d`;
    }
  };

  if (isLoading) {
    return (
      <StyledChatListContainer>
        <StyledEmptyState>
          <p>Loading conversations...</p>
        </StyledEmptyState>
      </StyledChatListContainer>
    );
  }

  if (error) {
    return (
      <StyledChatListContainer>
        <StyledEmptyState>
          <p>Failed to load conversations</p>
        </StyledEmptyState>
      </StyledChatListContainer>
    );
  }

  return (
    <StyledChatListContainer>
      {!conversations || conversations.length === 0 ? (
        <StyledEmptyState>
          <p>No conversations yet</p>
          <p>Start chatting with someone to see your messages here</p>
        </StyledEmptyState>
      ) : (
        <StyledConversationsList>
          {conversations.map((conversation: Conversation) => {
            const profilePictureUrl = conversation.participantProfilePicture
              ? `${BUCKET_URL}/${conversation.participantProfilePicture}`
              : Icon;

            return (
              <StyledConversationItem
                key={conversation.participantId}
                onClick={() => onConversationSelect(conversation)}
              >
                <Avatar
                  src={profilePictureUrl}
                  alt={
                    conversation.participantName ||
                    conversation.participantUsername
                  }
                  width="48px"
                  height="48px"
                />

                <StyledConversationInfo>
                  <StyledContainer
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <StyledH5 style={{ margin: 0, fontSize: "16px" }}>
                      {conversation.participantName ||
                        conversation.participantUsername}
                    </StyledH5>
                    {conversation.lastMessage && (
                      <StyledP
                        primary={false}
                        style={{ fontSize: "12px", margin: 0 }}
                      >
                        {formatTimestamp(conversation.lastMessage.createdAt)}
                      </StyledP>
                    )}
                  </StyledContainer>

                  <StyledLastMessage>
                    {conversation.lastMessage ? (
                      <p>{conversation.lastMessage.content}</p>
                    ) : (
                      <p>No messages yet</p>
                    )}

                    {conversation.unreadCount > 0 && (
                      <StyledUnreadBadge>
                        {conversation.unreadCount > 99
                          ? "99+"
                          : conversation.unreadCount}
                      </StyledUnreadBadge>
                    )}
                  </StyledLastMessage>
                </StyledConversationInfo>
              </StyledConversationItem>
            );
          })}
        </StyledConversationsList>
      )}
    </StyledChatListContainer>
  );
};

export default ChatList;
