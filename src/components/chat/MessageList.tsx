import React, { useEffect, useRef, useCallback } from "react";
import { Message } from "../../service/socketService";
import styled from "styled-components";

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

const StyledTimestamp = styled.span`
  font-size: 11px;
  color: ${(props) => props.theme.colors.placeholder};
  margin-top: 4px;
`;

const StyledTypingIndicator = styled.div`
  padding: 8px 16px;
  font-size: 12px;
  font-style: italic;
  color: ${(props) => props.theme.colors.placeholder};
`;

const StyledLoadMoreTrigger = styled.div`
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledLoadingIndicator = styled.div`
  padding: 12px;
  text-align: center;
  font-size: 12px;
  color: ${(props) => props.theme.colors.placeholder};
`;

interface MessageListProps {
  messages: Message[];
  currentUserId?: string;
  partnerTyping: boolean;
  partnerName: string;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onLoadMore?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  shouldScrollToBottom?: boolean;
  onScrolledToBottom?: () => void;
}

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

const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  partnerTyping,
  partnerName,
  messagesEndRef,
  onLoadMore,
  hasNextPage,
  isFetchingNextPage,
  shouldScrollToBottom = false,
  onScrolledToBottom,
}) => {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const previousScrollHeight = useRef<number>(0);
  const isInitialLoad = useRef<boolean>(true);
  const previousMessageCount = useRef<number>(0);

  // Intersection Observer for infinite scrolling
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        // Store current scroll position before loading more
        if (containerRef.current) {
          previousScrollHeight.current = containerRef.current.scrollHeight;
        }
        onLoadMore?.();
      }
    },
    [hasNextPage, isFetchingNextPage, onLoadMore]
  );

  // Handle scroll position after loading more messages
  useEffect(() => {
    if (
      containerRef.current &&
      !isInitialLoad.current &&
      isFetchingNextPage === false
    ) {
      // After loading more messages, adjust scroll to maintain position
      const newScrollHeight = containerRef.current.scrollHeight;
      const heightDifference = newScrollHeight - previousScrollHeight.current;

      if (heightDifference > 0) {
        containerRef.current.scrollTop += heightDifference;
      }
    }
  }, [isFetchingNextPage]);

  // Handle scroll to bottom
  useEffect(() => {
    if (
      shouldScrollToBottom &&
      messagesEndRef.current &&
      containerRef.current
    ) {
      if (isInitialLoad.current) {
        // For initial load, scroll instantly to bottom (no animation)
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
        isInitialLoad.current = false;
      } else {
        // For new messages, check if user is near bottom
        const container = containerRef.current;
        const isNearBottom =
          container.scrollHeight -
            container.scrollTop -
            container.clientHeight <
          100;

        if (isNearBottom) {
          // Use smooth scroll only if user is already near the bottom
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }
      onScrolledToBottom?.(); // Reset the flag
    }
  }, [shouldScrollToBottom, messagesEndRef, onScrolledToBottom]);

  // Track message count changes
  useEffect(() => {
    previousMessageCount.current = messages.length;
  }, [messages.length]);

  // Reset initial load flag when messages change (e.g., switching conversations)
  useEffect(() => {
    if (messages.length === 0) {
      isInitialLoad.current = true;
    }
  }, [messages.length]);

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    const option = {
      root: null,
      rootMargin: "20px",
      threshold: 0,
    };

    const observer = new IntersectionObserver(handleObserver, option);
    observer.observe(element);

    return () => observer.unobserve(element);
  }, [handleObserver]);

  return (
    <StyledMessagesContainer ref={containerRef}>
      {/* Load more trigger at the top */}
      {hasNextPage && (
        <StyledLoadMoreTrigger ref={loadMoreRef}>
          {isFetchingNextPage && (
            <StyledLoadingIndicator>
              Loading older messages...
            </StyledLoadingIndicator>
          )}
        </StyledLoadMoreTrigger>
      )}

      {messages.map((message) => {
        const isOwn = message.senderId === currentUserId;
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
          {partnerName} is typing...
        </StyledTypingIndicator>
      )}

      <div ref={messagesEndRef} />
    </StyledMessagesContainer>
  );
};

export default MessageList;
