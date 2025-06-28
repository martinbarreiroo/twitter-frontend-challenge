import React, { useRef, useCallback } from "react";
import Button from "../button/Button";
import { ButtonType } from "../button/StyledButton";
import styled from "styled-components";

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

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  value,
  onChange,
  onSend,
  onKeyPress,
  disabled = false,
}) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);

      // Auto-resize textarea
      const textarea = e.target;
      textarea.style.height = "20px";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 100)}px`;
    },
    [onChange]
  );

  return (
    <StyledInputContainer>
      <StyledMessageInput
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        onKeyUp={onKeyPress}
        placeholder="Type a message..."
        disabled={disabled}
      />
      <Button
        text="Send"
        buttonType={ButtonType.DEFAULT}
        size="SMALL"
        onClick={onSend}
        disabled={!value.trim() || disabled}
      />
    </StyledInputContainer>
  );
};

export default MessageInput;
