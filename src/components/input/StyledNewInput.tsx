import styled, { css } from "styled-components";

export enum InputVariant {
  OUTLINED = "outlined",
  FULFILLED = "fulfilled",
  GHOST = "ghost",
  WHITE = "white",
}

export enum InputSize {
  SMALL = "small",
  MEDIUM = "medium",
  LARGE = "large",
}

export enum InputState {
  DEFAULT = "default",
  FOCUS = "focus",
  ERROR = "error",
  DISABLED = "disabled",
  SUCCESS = "success",
}

interface StyledNewInputProps {
  variant: InputVariant;
  $size: InputSize;
  state?: InputState;
  fullWidth?: boolean;
  hasLabel?: boolean;
}

const getInputStyles = (
  variant: InputVariant,
  state: InputState = InputState.DEFAULT
) => {
  const isDisabled = state === InputState.DISABLED;
  const isError = state === InputState.ERROR;
  const isFocus = state === InputState.FOCUS;
  const isSuccess = state === InputState.SUCCESS;

  switch (variant) {
    case InputVariant.OUTLINED:
      return css`
        background: ${(props) => props.theme.colors.white};
        border: 1px solid
          ${(props) => {
            if (isError) return props.theme.colors.error;
            if (isSuccess) return props.theme.colors.main;
            if (isFocus) return props.theme.colors.main;
            if (isDisabled) return props.theme.colors.outline;
            return props.theme.colors.outline;
          }};
        color: ${(props) =>
          isDisabled ? props.theme.colors.text : props.theme.colors.black};

        &:hover:not(:disabled) {
          border-color: ${(props) =>
            isError ? props.theme.colors.error : props.theme.colors.main};
        }

        &:focus {
          border-color: ${(props) =>
            isError ? props.theme.colors.error : props.theme.colors.main};
          outline: none;
          box-shadow: 0 0 0 2px
            ${(props) =>
              isError
                ? props.theme.colors.error + "20"
                : props.theme.colors.main + "20"};
        }
      `;

    case InputVariant.FULFILLED:
      return css`
        background: ${(props) =>
          isDisabled
            ? props.theme.colors.inactiveBackground
            : props.theme.colors.inactiveBackground};
        border: 1px solid
          ${(props) => {
            if (isError) return props.theme.colors.error;
            if (isSuccess) return props.theme.colors.main;
            if (isFocus) return props.theme.colors.main;
            return "transparent";
          }};
        color: ${(props) =>
          isDisabled ? props.theme.colors.text : props.theme.colors.black};

        &:hover:not(:disabled) {
          background: ${(props) => props.theme.colors.hover};
        }

        &:focus {
          background: ${(props) => props.theme.colors.white};
          border-color: ${(props) =>
            isError ? props.theme.colors.error : props.theme.colors.main};
          outline: none;
          box-shadow: 0 0 0 2px
            ${(props) =>
              isError
                ? props.theme.colors.error + "20"
                : props.theme.colors.main + "20"};
        }
      `;

    case InputVariant.GHOST:
      return css`
        background: transparent;
        border: 1px solid transparent;
        color: ${(props) =>
          isDisabled ? props.theme.colors.text : props.theme.colors.black};
        border-bottom: 1px solid
          ${(props) => {
            if (isError) return props.theme.colors.error;
            if (isSuccess) return props.theme.colors.main;
            if (isFocus) return props.theme.colors.main;
            return props.theme.colors.outline;
          }};
        border-radius: 0;

        &:hover:not(:disabled) {
          border-bottom-color: ${(props) =>
            isError ? props.theme.colors.error : props.theme.colors.main};
        }

        &:focus {
          border-bottom-color: ${(props) =>
            isError ? props.theme.colors.error : props.theme.colors.main};
          outline: none;
        }
      `;

    case InputVariant.WHITE:
      return css`
        background: ${(props) => props.theme.colors.white};
        border: 1px solid
          ${(props) => {
            if (isError) return props.theme.colors.error;
            if (isSuccess) return props.theme.colors.main;
            if (isFocus) return props.theme.colors.main;
            return props.theme.colors.containerLine;
          }};
        color: ${(props) =>
          isDisabled ? props.theme.colors.text : props.theme.colors.black};

        &:hover:not(:disabled) {
          border-color: ${(props) =>
            isError ? props.theme.colors.error : props.theme.colors.outline};
        }

        &:focus {
          border-color: ${(props) =>
            isError ? props.theme.colors.error : props.theme.colors.main};
          outline: none;
          box-shadow: 0 0 0 2px
            ${(props) =>
              isError
                ? props.theme.colors.error + "20"
                : props.theme.colors.main + "20"};
        }
      `;

    default:
      return css``;
  }
};

const getSizeStyles = (size: InputSize) => {
  switch (size) {
    case InputSize.SMALL:
      return css`
        padding: 8px 12px;
        font-size: 15px;
        min-height: 40px;
        border-radius: 8px;
      `;

    case InputSize.MEDIUM:
      return css`
        padding: 8px 16px;
        font-size: 15px;
        min-height: 48px;
        border-radius: 8px;
      `;

    case InputSize.LARGE:
      return css`
        padding: 12px 16px;
        font-size: 15px;
        min-height: 56px;
        border-radius: 8px;
      `;

    default:
      return css``;
  }
};

export const StyledInputContainer = styled.div<{ fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 4px;
  ${(props) =>
    props.fullWidth &&
    css`
      width: 100%;
    `}
`;

export const StyledInputLabel = styled.label<{
  $size: InputSize;
  state?: InputState;
}>`
  font-family: ${(props) => props.theme.font.default};
  font-weight: 400;
  color: ${(props) => {
    if (props.state === InputState.ERROR) return props.theme.colors.error;
    if (props.state === InputState.DISABLED) return props.theme.colors.text;
    return props.theme.colors.text;
  }};
  font-size: 15px;
  margin-bottom: 4px;
`;

export const StyledNewInput = styled.input<StyledNewInputProps>`
  font-family: ${(props) => props.theme.font.default};
  font-weight: 400;
  line-height: 110%;
  transition: all 0.3s ease-in-out;
  outline: none;
  box-sizing: border-box;

  ${(props) =>
    props.fullWidth &&
    css`
      width: 100%;
    `}

  ${(props) => getSizeStyles(props.$size)}
  ${(props) => getInputStyles(props.variant, props.state)}
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &::placeholder {
    color: ${(props) => props.theme.colors.text};
    opacity: 0.7;
  }
`;

export const StyledInputHelperText = styled.span<{
  state?: InputState;
  $size: InputSize;
}>`
  font-family: ${(props) => props.theme.font.default};
  color: ${(props) => {
    if (props.state === InputState.ERROR) return props.theme.colors.error;
    if (props.state === InputState.SUCCESS) return props.theme.colors.main;
    return props.theme.colors.text;
  }};
  font-size: 12px;
  margin-top: 4px;
  margin-left: 8px;
  line-height: 110%;
  letter-spacing: -0.12px;
`;
