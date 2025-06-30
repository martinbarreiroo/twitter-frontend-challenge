import React, { ChangeEventHandler } from "react";
import Avatar from "../common/avatar/Avatar";
import Icon from "../../assets/icon.jpg";
import { StyledTweetInputContainer } from "./TweetInputContainer";
import { StyledBorderlessTextArea } from "./BorderlessTextArea";
import CharacterCount from "../common/CharacterCount";
import styled from "styled-components";

const StyledErrorMessage = styled.div`
  color: ${(props) => props.theme.colors.error};
  font-size: 12px;
  font-family: "Manrope", sans-serif;
  margin-top: 4px;
  margin-left: 56px;
  line-height: 110%;
  letter-spacing: -0.12px;
`;

const StyledCharacterCountContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-right: 8px;
  margin-top: 4px;
`;

interface FormikTweetInputProps {
  placeholder: string;
  src?: string;
  alt?: string;
  maxLength: number;
  name: string;
  value: string;
  error?: string;
  touched?: boolean;
  onChange: ChangeEventHandler<HTMLTextAreaElement>;
  onBlur: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
}

const FormikTweetInput = ({
  placeholder,
  src,
  alt,
  maxLength,
  name,
  value,
  error,
  touched,
  onChange,
  onBlur,
}: FormikTweetInputProps) => {
  const hasError = error && touched;
  const isOverLimit = value.length > maxLength;
  const fullSrc =
    src && process.env.REACT_APP_BUCKET_URL
      ? `${process.env.REACT_APP_BUCKET_URL}/${src}`
      : src;

  return (
    <div>
      <StyledTweetInputContainer>
        <Avatar src={fullSrc ?? Icon} alt={alt ?? "Icon"} />
        <StyledBorderlessTextArea
          name={name}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          value={value}
          className={hasError || isOverLimit ? "error" : ""}
        />
      </StyledTweetInputContainer>
      <StyledCharacterCountContainer>
        <CharacterCount current={value.length} max={maxLength} />
      </StyledCharacterCountContainer>
      {hasError && <StyledErrorMessage>{error}</StyledErrorMessage>}
    </div>
  );
};

export default FormikTweetInput;
