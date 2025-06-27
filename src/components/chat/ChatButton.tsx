import React from "react";
import { useNavigate } from "react-router-dom";
import { useCanChat } from "../../hooks/useChats";
import { useCurrentUser } from "../../hooks/useUser";
import Button from "../button/Button";
import { ButtonType } from "../button/StyledButton";
import { useToast } from "../../contexts/ToastContext";

interface ChatButtonProps {
  userId: string;
  size?: string;
}

const ChatButton: React.FC<ChatButtonProps> = ({ userId, size = "MEDIUM" }) => {
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const { data: canChatData, isLoading: canChatLoading } = useCanChat(userId);
  const { showError } = useToast();

  // Don't show chat button for self
  if (user?.id === userId) {
    return null;
  }

  const handleChatClick = async () => {
    if (!canChatData?.canChat) {
      showError("You need to follow each other to send messages");
      return;
    }

    try {
      // Navigate directly to chat with this user
      navigate(`/chat/${userId}`);
    } catch (error) {
      console.error("Error starting chat:", error);
      showError("Failed to start chat. Please try again.");
    }
  };

  if (canChatLoading) {
    return (
      <Button
        text="..."
        buttonType={ButtonType.OUTLINED}
        size={size}
        disabled={true}
      />
    );
  }

  return (
    <Button
      text="Message"
      buttonType={ButtonType.OUTLINED}
      size={size}
      onClick={handleChatClick}
      disabled={!canChatData?.canChat}
    />
  );
};

export default ChatButton;
