import React from "react";
import { StyledBlurredBackground } from "../../common/BlurredBackground";
import { useClickOutside } from "../../../hooks";

interface ImageModalProps {
  src: string;
  alt: string;
  onClose: () => void;
  show: boolean;
}
const ImageModal = ({ src, alt, onClose, show }: ImageModalProps) => {
  // Use click outside hook to close modal when clicking outside the image
  const imageRef = useClickOutside<HTMLImageElement>(onClose);

  return (
    <>
      {show && (
        <StyledBlurredBackground
          onClick={onClose}
          alignItems={"center"}
          justifyContent={"center"}
        >
          <img
            ref={imageRef}
            style={{ maxWidth: "600px" }}
            width={"100%"}
            height={"auto"}
            src={src}
            alt={alt}
            onClick={(e) => e.stopPropagation()}
          />
        </StyledBlurredBackground>
      )}
    </>
  );
};

export default ImageModal;
