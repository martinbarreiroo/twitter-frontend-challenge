import React, { ChangeEvent, useRef, useState } from "react";
import { StyledInputContainer } from "./InputContainer";
import { StyledInputTitle } from "./InputTitle";
import { StyledInputElement } from "./StyledInputElement";
import styled from "styled-components";

const StyledErrorMessage = styled.div`
  color: ${(props) => props.theme.colors.error};
  font-size: 12px;
  font-family: "Manrope", sans-serif;
  margin-top: 4px;
  margin-left: 8px;
  line-height: 110%;
  letter-spacing: -0.12px;
`;

interface FormikLabeledInputProps {
  type?: "password" | "text" | "email";
  title: string;
  placeholder: string;
  required?: boolean;
  name: string;
  value: string;
  error?: string;
  touched?: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
}

const FormikLabeledInput = ({
  title,
  placeholder,
  required,
  name,
  value,
  error,
  touched,
  onChange,
  onBlur,
  type = "text",
}: FormikLabeledInputProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [focus, setFocus] = useState(false);

  const hasError: string | boolean | undefined = error && touched;

  const handleFocus = () => {
    setFocus(true);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocus(false);
    onBlur(e);
  };

  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div>
      <StyledInputContainer
        className={`${hasError ? "error" : ""} ${focus ? "active-div" : ""}`}
        onClick={handleClick}
      >
        <StyledInputTitle
          className={`${focus || value ? "active-label" : ""} ${
            hasError ? "error" : ""
          }`}
        >
          {title}
        </StyledInputTitle>
        <StyledInputElement
          type={type}
          required={required}
          placeholder={placeholder}
          name={name}
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={onChange}
          className={hasError ? "error" : ""}
          ref={inputRef}
        />
      </StyledInputContainer>
      {hasError && <StyledErrorMessage>{error}</StyledErrorMessage>}
    </div>
  );
};

export default FormikLabeledInput;
