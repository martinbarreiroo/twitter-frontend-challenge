import React from "react";
import { StyledAvatarContainer } from "./AvatarContainer";
import NameImage from "./NameImage";

interface AvatarProps {
  src: string;
  alt: string;
  onClick?: () => void;
  width?: string;
  height?: string;
}

const Avatar = ({ src, alt, onClick, width, height }: AvatarProps) => {
  return (
    <StyledAvatarContainer onClick={onClick} width={width} height={height}>
      {src && src !== "null" && src !== "undefined" ? (
        <img src={src} alt={alt} />
      ) : (
        <NameImage name={alt} />
      )}
    </StyledAvatarContainer>
  );
};
export default Avatar;
