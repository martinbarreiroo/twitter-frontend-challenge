import React, { ReactNode } from "react";
import { StyledBlurredBackground } from "../common/BlurredBackground";
import { ModalCloseButton } from "../common/ModalCloseButton";
import { StyledTweetModalContainer } from "../tweet-modal/TweetModalContainer";
import { useModalClickOutside } from "../../hooks";
import Portal from "../common/Portal";

interface PostModalProps {
  onClose: () => void;
  show: boolean;
  children: ReactNode;
}

export const PostModal = ({ onClose, show, children }: PostModalProps) => {
  // Use modal-specific click outside hook for portal compatibility
  const modalRef = useModalClickOutside<HTMLDivElement>(onClose);

  return (
    <>
      {show && (
        <Portal>
          <StyledBlurredBackground onClick={onClose}>
            <StyledTweetModalContainer
              ref={modalRef}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalCloseButton onClick={onClose} />
              {children}
            </StyledTweetModalContainer>
          </StyledBlurredBackground>
        </Portal>
      )}
    </>
  );
};
