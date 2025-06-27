import React, { useState, useEffect, useRef, useCallback } from "react";
import { useConversation, useMarkAsRead } from "../../hooks/useChats";
import { useCurrentUser, useProfile } from "../../hooks/useUser";
import { useHttpRequestService } from "../../service/HttpRequestService";
import socketService, { Message } from "../../service/socketService";
import { StyledContainer } from "../common/Container";
import { StyledP, StyledH5 } from "../common/text";
import Avatar from "../common/avatar/Avatar";
import Button from "../button/Button";
import { ButtonType } from "../button/StyledButton";
import Icon from "../../assets/icon.jpg";
import { useToast } from "../../contexts/ToastContext";
import { useQueryClient } from "@tanstack/react-query";
import styled from "styled-components";

const StyledChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 500px;
  border: 1px solid ${(props) => props.theme.colors.containerLine};
  border-radius: 16px;
  background: ${(props) => props.theme.background};
`;

const StyledChatHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid ${(props) => props.theme.colors.containerLine};
  gap: 12px;
`;

const StyledMessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 12px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const StyledMessageBubble = styled.div<{ isOwn: boolean }>`
  max-width: 30%;
  padding: 12px 16px;
  border-radius: 18px;
  background: ${(props) =>
    props.isOwn ? props.theme.colors.main : props.theme.colors.containerLine};
  color: ${(props) => (props.isOwn ? "white" : props.theme.colors.text)};
  align-self: ${(props) => (props.isOwn ? "flex-end" : "flex-start")};
  margin-left: ${(props) => (props.isOwn ? "auto" : "0")};
  margin-right: ${(props) => (props.isOwn ? "0" : "auto")};
  word-wrap: break-word;

  p {
    margin: 0;
    font-size: 14px;
    line-height: 1.4;
  }
`;

const StyledMessageInfo = styled.div<{ isOwn: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  justify-content: ${(props) => (props.isOwn ? "flex-end" : "flex-start")};
  margin-left: ${(props) => (props.isOwn ? "auto" : "0")};
  margin-right: ${(props) => (props.isOwn ? "0" : "auto")};
  max-width: 70%;
`;

const StyledInputContainer = styled.div`
  display: flex;
  padding: 12px 20px;
  border-top: 1px solid ${(props) => props.theme.colors.containerLine};
  gap: 12px;
  align-items: flex-end;
`;

const StyledMessageInput = styled.textarea`
  flex: 1;
  min-height: 20px;
  max-height: 100px;
  padding: 12px;
  border: 1px solid ${(props) => props.theme.colors.containerLine};
  border-radius: 20px;
  resize: none;
  outline: none;
  background: ${(props) => props.theme.background};
  color: ${(props) => props.theme.colors.text};
  font-family: ${(props) => props.theme.font.default};
  font-size: 14px;

  &:focus {
    border-color: ${(props) => props.theme.colors.main};
  }

  &::placeholder {
    color: ${(props) => props.theme.colors.placeholder};
  }
`;

const StyledConnectionStatus = styled.div<{ status: string }>`
  padding: 8px 16px;
  background: ${(props) => {
    switch (props.status) {
      case "connected":
        return "#10b981";
      case "connecting":
        return "#f59e0b";
      default:
        return "#ef4444";
    }
  }};
  color: white;
  font-size: 12px;
  text-align: center;

  &.disconnected {
    background: #fef3f2;
    color: #dc2626;
    border: 1px solid #fecaca;
  }
`;

const StyledTypingIndicator = styled.div`
  padding: 8px 16px;
  font-size: 12px;
  font-style: italic;
  color: ${(props) => props.theme.colors.placeholder};
`;

const StyledTimestamp = styled.span`
  font-size: 11px;
  color: ${(props) => props.theme.colors.placeholder};
  margin-top: 4px;
`;

interface ChatProps {
  partnerId: string;
  partnerName?: string;
  partnerUsername?: string;
  partnerProfilePicture?: string;
  onClose?: () => void;
}

const BUCKET_URL = process.env.REACT_APP_BUCKET_URL;

const Chat: React.FC<ChatProps> = ({
  partnerId,
  partnerName,
  partnerUsername,
  partnerProfilePicture,
  onClose,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "connecting" | "disconnected"
  >("disconnected");

  const { data: user } = useCurrentUser();
  const { data: partnerProfile } = useProfile(partnerId); // Fetch partner's profile data
  const { data: conversationData } = useConversation(partnerId, { limit: 50 });
  const markAsReadMutation = useMarkAsRead();
  const httpService = useHttpRequestService();
  const { showError } = useToast();
  const queryClient = useQueryClient();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Monitor socket connection status (don't try to connect - AuthContext handles that)
  useEffect(() => {
    const checkConnectionStatus = () => {
      const status = socketService.getConnectionStatus();
      setConnectionStatus(status);
    };

    // Check initial status
    checkConnectionStatus();

    // Set up a periodic check for connection status
    const interval = setInterval(checkConnectionStatus, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [user?.id]);

  // Subscribe to real-time messages - separate effect to handle reconnections
  useEffect(() => {
    if (!user?.id || !partnerId) return;

    const currentPartnerId = partnerId; // Capture current partnerId for this effect
    console.log(`Setting up socket listeners for partner: ${currentPartnerId}`);

    // Function to set up subscriptions
    const setupSubscriptions = () => {
      console.log(
        `Setting up subscriptions for ${currentPartnerId}, socket connected: ${socketService.isConnected()}`
      );

      const unsubscribeMessages = socketService.subscribeToMessages(
        (message: Message) => {
          console.log(
            `Received message for partner ${currentPartnerId}:`,
            message
          );
          // Only add messages that are part of THIS conversation (use captured partnerId)
          if (
            message.senderId === currentPartnerId ||
            message.receiverId === currentPartnerId
          ) {
            console.log(
              `Message matches current conversation with ${currentPartnerId}`
            );
            setMessages((prev) => {
              // Check if message already exists
              if (prev.some((m) => m.id === message.id)) {
                console.log(`Message ${message.id} already exists, skipping`);
                return prev;
              }
              // Add new message and sort to maintain chronological order
              const updated = [...prev, message].sort(
                (a, b) =>
                  new Date(a.createdAt).getTime() -
                  new Date(b.createdAt).getTime()
              );
              console.log(
                `Added message ${message.id} to conversation with ${currentPartnerId}`
              );
              return updated;
            });

            // Don't refresh conversations from individual chat - MessagesPage handles this
            setTimeout(scrollToBottom, 100);
          } else {
            console.log(
              `Message ignored - not for current conversation with ${currentPartnerId}`
            );
            // Still add to global state for other conversations, but don't scroll or show
            setMessages((prev) => {
              // Check if message already exists
              if (prev.some((m) => m.id === message.id)) {
                return prev;
              }
              // Add message to global state for when user switches to that conversation
              return [...prev, message].sort(
                (a, b) =>
                  new Date(a.createdAt).getTime() -
                  new Date(b.createdAt).getTime()
              );
            });
          }
        }
      );

      const unsubscribeTyping = socketService.subscribeToTyping(
        ({ userId, isTyping }) => {
          if (userId === currentPartnerId) {
            setPartnerTyping(isTyping);
          }
        }
      );

      const unsubscribeMarkedAsRead =
        socketService.subscribeToMessagesMarkedAsRead(({ userId }) => {
          if (userId === currentPartnerId) {
            // Update messages to mark them as read
            setMessages((prev) =>
              prev.map((msg) =>
                msg.senderId === user?.id ? { ...msg, isRead: true } : msg
              )
            );
          }
        });

      return () => {
        console.log(
          `Cleaning up socket listeners for partner: ${currentPartnerId}`
        );
        unsubscribeMessages();
        unsubscribeTyping();
        unsubscribeMarkedAsRead();
      };
    };

    // Set up subscriptions immediately if socket is connected
    let cleanup: (() => void) | undefined;
    if (socketService.isConnected()) {
      cleanup = setupSubscriptions();
    }

    // Also set up a connection status monitor to re-establish subscriptions after reconnection
    const connectionCheckInterval = setInterval(() => {
      const isConnected = socketService.isConnected();
      if (isConnected && !cleanup) {
        // Socket just connected, set up subscriptions
        console.log(
          `Socket reconnected, setting up subscriptions for ${currentPartnerId}`
        );
        cleanup = setupSubscriptions();
      } else if (!isConnected && cleanup) {
        // Socket disconnected, clean up subscriptions
        console.log(
          `Socket disconnected, cleaning up subscriptions for ${currentPartnerId}`
        );
        cleanup();
        cleanup = undefined;
      }
    }, 1000);

    return () => {
      console.log(`Chat effect cleanup for partner: ${currentPartnerId}`);
      clearInterval(connectionCheckInterval);
      if (cleanup) {
        cleanup();
      }
    };
  }, [partnerId, user?.id, scrollToBottom]);

  // Load initial messages from conversation data and merge with real-time messages
  useEffect(() => {
    if (conversationData) {
      if (conversationData.length > 0) {
        // Always set the conversation data as the source of truth for this conversation
        setMessages((prevMessages) => {
          // Keep messages from other conversations
          const otherConversationMessages = prevMessages.filter(
            (msg) =>
              !(
                (msg.senderId === partnerId && msg.receiverId === user?.id) ||
                (msg.senderId === user?.id && msg.receiverId === partnerId)
              )
          );

          // Get real-time messages for current conversation that aren't in conversation data
          const currentConversationMessages = prevMessages.filter(
            (msg) =>
              (msg.senderId === partnerId && msg.receiverId === user?.id) ||
              (msg.senderId === user?.id && msg.receiverId === partnerId)
          );

          // Create a map of conversation data IDs
          const conversationIds = new Set(
            conversationData.map((m: Message) => m.id)
          );

          // Keep real-time messages that aren't in conversation data (newer messages)
          const realtimeOnly = currentConversationMessages.filter(
            (msg) => !conversationIds.has(msg.id)
          );

          // Combine conversation data with newer real-time messages
          const currentConversationCombined = [
            ...conversationData,
            ...realtimeOnly,
          ].sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );

          // Combine with messages from other conversations
          const finalMessages = [
            ...otherConversationMessages,
            ...currentConversationCombined,
          ];
          console.log(`Final messages count: ${finalMessages.length}`);

          return finalMessages;
        });
      } else {
        // If conversation data is explicitly empty (no messages), set empty for this conversation
        setMessages((prevMessages) => {
          // Keep messages from other conversations
          const otherConversationMessages = prevMessages.filter(
            (msg) =>
              !(
                (msg.senderId === partnerId && msg.receiverId === user?.id) ||
                (msg.senderId === user?.id && msg.receiverId === partnerId)
              )
          );

          // Check if we have real-time messages for this conversation
          const currentConversationMessages = prevMessages.filter(
            (msg) =>
              (msg.senderId === partnerId && msg.receiverId === user?.id) ||
              (msg.senderId === user?.id && msg.receiverId === partnerId)
          );

          if (currentConversationMessages.length > 0) {
            // Keep real-time messages even if conversation data is empty
            return [
              ...otherConversationMessages,
              ...currentConversationMessages.sort(
                (a, b) =>
                  new Date(a.createdAt).getTime() -
                  new Date(b.createdAt).getTime()
              ),
            ];
          } else {
            return otherConversationMessages;
          }
        });
      }
      setTimeout(scrollToBottom, 100);
    }
    // If conversationData is undefined/null, don't change messages (still loading)
  }, [conversationData, partnerId, user?.id, scrollToBottom]);

  // Force refetch conversation data when returning to a chat
  useEffect(() => {
    if (partnerId && user?.id) {
      // Invalidate and refetch conversation data to get any messages received while away
      queryClient.invalidateQueries({ queryKey: ["conversation", partnerId] });
    }
  }, [partnerId, user?.id, queryClient]);

  // Clear only UI state when switching to a different partner (not messages - let conversation data reload)
  useEffect(() => {
    setPartnerTyping(false);
    setNewMessage(""); // Also clear any typed message
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = "20px";
    }
    // Don't clear messages here - let the conversation data effect handle message loading
  }, [partnerId]);

  // Clean up temporary messages when real messages arrive (conversation-specific)
  useEffect(() => {
    setMessages((prev) => {
      // Get all messages for current conversation
      const currentConversationMessages = prev.filter(
        (msg) =>
          (msg.senderId === partnerId && msg.receiverId === user?.id) ||
          (msg.senderId === user?.id && msg.receiverId === partnerId)
      );

      // Get messages for other conversations (preserve them)
      const otherConversationMessages = prev.filter(
        (msg) =>
          !(
            (msg.senderId === partnerId && msg.receiverId === user?.id) ||
            (msg.senderId === user?.id && msg.receiverId === partnerId)
          )
      );

      // Remove temporary messages that have been replaced by real ones for current conversation
      const realMessages = currentConversationMessages.filter(
        (m) => !m.id.startsWith("temp-")
      );
      const tempMessages = currentConversationMessages.filter((m) =>
        m.id.startsWith("temp-")
      );

      // Remove temp messages that have a real equivalent (same content and sender)
      const filteredTempMessages = tempMessages.filter((tempMsg) => {
        return !realMessages.some(
          (realMsg) =>
            realMsg.content === tempMsg.content &&
            realMsg.senderId === tempMsg.senderId &&
            Math.abs(
              new Date(realMsg.createdAt).getTime() -
                new Date(tempMsg.createdAt).getTime()
            ) < 10000 // Within 10 seconds
        );
      });

      // Combine current conversation messages with other conversation messages
      const currentConversationCleaned = [
        ...realMessages,
        ...filteredTempMessages,
      ].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      return [...otherConversationMessages, ...currentConversationCleaned];
    });
  }, [conversationData, partnerId, user?.id]); // Run when conversation data updates or partner changes
  useEffect(() => {
    if (conversationData && conversationData.length > 0 && user?.id) {
      const unreadMessages = conversationData.filter(
        (msg: Message) => msg.senderId === partnerId && !msg.isRead
      );

      if (unreadMessages.length > 0) {
        // Use a small delay to avoid rapid successive calls
        const timeoutId = setTimeout(() => {
          markAsReadMutation.mutate({ conversationPartnerId: partnerId });
          socketService.markAsRead({ conversationPartnerId: partnerId });
        }, 500);

        return () => clearTimeout(timeoutId);
      }
    }
  }, [conversationData, partnerId, user?.id, markAsReadMutation]); // Only run when conversationData changes

  // Handle sending messages
  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !user?.id) return;

    const messageContent = newMessage.trim();
    setNewMessage("");

    // Adjust textarea height
    if (inputRef.current) {
      inputRef.current.style.height = "20px";
    }

    // Try socket first, fallback to HTTP if socket not connected
    if (socketService.isConnected()) {
      socketService.sendMessage(
        partnerId,
        { content: messageContent },
        (response) => {
          if (!response.success) {
            showError(response.error || "Failed to send message");
          }
          // Don't refresh conversations from individual chat - MessagesPage handles this
        }
      );
    } else {
      // Fallback to HTTP API
      try {
        await httpService.sendMessage(partnerId, { content: messageContent });

        // Don't refresh conversations from individual chat - MessagesPage handles this

        // Create temporary message for immediate feedback
        const tempMessage: Message = {
          id: `temp-${Date.now()}`, // Use temp prefix to identify temporary messages
          content: messageContent,
          senderId: user.id,
          receiverId: partnerId,
          isRead: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setMessages((prev) => {
          // Add temp message, but it will be replaced when real message arrives
          const updated = [...prev, tempMessage].sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          return updated;
        });

        setTimeout(scrollToBottom, 100);
      } catch (error) {
        showError("Failed to send message");
        console.error("Error sending message via HTTP:", error);
      }
    }
  }, [newMessage, partnerId, user?.id, showError, scrollToBottom, queryClient]);

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      socketService.sendTypingIndicator({
        receiverId: partnerId,
        isTyping: true,
      });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socketService.sendTypingIndicator({
        receiverId: partnerId,
        isTyping: false,
      });
    }, 1000);
  }, [isTyping, partnerId]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    handleTyping();

    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = "20px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 100)}px`;
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString();
    }
  };

  // Use props first, then fallback to fetched profile data
  const displayName = partnerName || partnerProfile?.name || "Unknown User";
  const displayUsername =
    partnerUsername || partnerProfile?.username || "unknown";
  const displayProfilePicture =
    partnerProfilePicture || partnerProfile?.profilePicture;

  const profilePictureUrl = displayProfilePicture
    ? `${BUCKET_URL}/${displayProfilePicture}`
    : Icon;

  return (
    <StyledChatContainer>
      {/* Connection Status */}
      {connectionStatus !== "connected" && (
        <StyledConnectionStatus
          status={connectionStatus}
          className={connectionStatus === "disconnected" ? "disconnected" : ""}
        >
          {connectionStatus === "connecting"
            ? "Connecting to chat server..."
            : "Chat service unavailable - using fallback mode"}
        </StyledConnectionStatus>
      )}

      {/* Chat Header */}
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
        {onClose && (
          <Button
            text="×"
            buttonType={ButtonType.OUTLINED}
            size="SMALL"
            onClick={onClose}
          />
        )}
      </StyledChatHeader>

      {/* Messages */}
      <StyledMessagesContainer>
        {messages
          .filter(
            (message) =>
              // Only show messages for current conversation
              (message.senderId === partnerId &&
                message.receiverId === user?.id) ||
              (message.senderId === user?.id &&
                message.receiverId === partnerId)
          )
          .map((message) => {
            const isOwn = message.senderId === user?.id;
            return (
              <div key={message.id}>
                <StyledMessageInfo isOwn={isOwn}>
                  <StyledTimestamp>
                    {formatTimestamp(message.createdAt)}
                  </StyledTimestamp>
                  {isOwn && message.isRead && (
                    <StyledTimestamp>✓ Read</StyledTimestamp>
                  )}
                </StyledMessageInfo>
                <StyledMessageBubble isOwn={isOwn}>
                  <p>{message.content}</p>
                </StyledMessageBubble>
              </div>
            );
          })}

        {/* Typing Indicator */}
        {partnerTyping && (
          <StyledTypingIndicator>
            {displayName} is typing...
          </StyledTypingIndicator>
        )}

        <div ref={messagesEndRef} />
      </StyledMessagesContainer>

      {/* Message Input */}
      <StyledInputContainer>
        <StyledMessageInput
          ref={inputRef}
          value={newMessage}
          onChange={handleInputChange}
          onKeyUp={handleKeyPress}
          placeholder="Type a message..."
          disabled={false} // Always allow typing - we have HTTP fallback
        />
        <Button
          text="Send"
          buttonType={ButtonType.DEFAULT}
          size="SMALL"
          onClick={handleSendMessage}
          disabled={!newMessage.trim()} // Only disable if no message content
        />
      </StyledInputContainer>
    </StyledChatContainer>
  );
};

export default Chat;
