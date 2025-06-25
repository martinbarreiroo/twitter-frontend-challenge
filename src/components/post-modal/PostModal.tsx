import React, { ReactNode } from "react";
import { StyledBlurredBackground } from "../common/BlurredBackground";
import { ModalCloseButton } from "../common/ModalCloseButton";
import { StyledTweetModalContainer } from "../tweet-modal/TweetModalContainer";
import { useClickOutside } from "../../hooks";

interface PostModalProps {
  onClose: () => void;
  show: boolean;
  children: ReactNode;
}

export const PostModal = ({ onClose, show, children }: PostModalProps) => {
  // Use click outside hook to close modal when clicking on the blurred background
  const modalRef = useClickOutside<HTMLDivElement>(onClose);

  return (
    <>
      {show && (
        <StyledBlurredBackground onClick={onClose}>
          <StyledTweetModalContainer
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
          >
            <ModalCloseButton onClick={onClose} />
            {children}
          </StyledTweetModalContainer>
        </StyledBlurredBackground>
      )}
    </>
  );
};
