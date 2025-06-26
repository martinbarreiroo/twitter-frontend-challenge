import styled, { css } from "styled-components";

export enum ButtonVariant {
  OUTLINED = "outlined",
  FULFILLED = "fulfilled",
  GHOST = "ghost",
  WHITE = "white",
}

export enum ButtonSize {
  SMALL = "small",
  MEDIUM = "medium",
  LARGE = "large",
}

export enum ButtonState {
  DEFAULT = "default",
  HOVER = "hover",
  ACTIVE = "active",
  DISABLED = "disabled",
  LOADING = "loading",
}

interface StyledNewButtonProps {
  variant: ButtonVariant;
  size: ButtonSize;
  state?: ButtonState;
  fullWidth?: boolean;
}

const getButtonStyles = (
  variant: ButtonVariant,
  state: ButtonState = ButtonState.DEFAULT
) => {
  const isDisabled = state === ButtonState.DISABLED;

  switch (variant) {
    case ButtonVariant.OUTLINED:
      return css`
        background: ${(props) => props.theme.colors.white};
        border: 1px solid
          ${(props) =>
            isDisabled ? props.theme.colors.outline : props.theme.colors.main};
        color: ${(props) =>
          isDisabled ? props.theme.colors.text : props.theme.colors.main};

        &:hover:not(:disabled) {
          background: ${(props) => props.theme.colors.inactiveBackground};
          border-color: ${(props) => props.theme.colors.dark};
        }

        &:active:not(:disabled) {
          background: ${(props) => props.theme.colors.hover};
          transform: scale(0.98);
        }
      `;

    case ButtonVariant.FULFILLED:
      return css`
        background: ${(props) =>
          isDisabled ? props.theme.colors.light : props.theme.colors.main};
        border: 1px solid
          ${(props) =>
            isDisabled ? props.theme.colors.light : props.theme.colors.main};
        color: ${(props) => props.theme.colors.white};

        &:hover:not(:disabled) {
          background: ${(props) => props.theme.colors.dark};
          border-color: ${(props) => props.theme.colors.dark};
        }

        &:active:not(:disabled) {
          background: ${(props) => props.theme.colors.dark};
          transform: scale(0.98);
        }
      `;

    case ButtonVariant.GHOST:
      return css`
        background: transparent;
        border: 1px solid transparent;
        color: ${(props) =>
          isDisabled ? props.theme.colors.text : props.theme.colors.main};

        &:hover:not(:disabled) {
          background: ${(props) => props.theme.colors.inactiveBackground};
        }

        &:active:not(:disabled) {
          background: ${(props) => props.theme.colors.hover};
          transform: scale(0.98);
        }
      `;

    case ButtonVariant.WHITE:
      return css`
        background: ${(props) => props.theme.colors.white};
        border: 1px solid ${(props) => props.theme.colors.containerLine};
        color: ${(props) =>
          isDisabled ? props.theme.colors.text : props.theme.colors.black};

        &:hover:not(:disabled) {
          background: ${(props) => props.theme.colors.inactiveBackground};
          border-color: ${(props) => props.theme.colors.outline};
        }

        &:active:not(:disabled) {
          background: ${(props) => props.theme.colors.hover};
          transform: scale(0.98);
        }
      `;

    default:
      return css``;
  }
};

const getSizeStyles = (size: ButtonSize) => {
  switch (size) {
    case ButtonSize.SMALL:
      return css`
        padding: 6px 16px;
        font-size: 15px;
        min-height: 36px;
        border-radius: 40px;
      `;

    case ButtonSize.MEDIUM:
      return css`
        padding: 8px 16px;
        font-size: 15px;
        min-height: 40px;
        border-radius: 40px;
      `;

    case ButtonSize.LARGE:
      return css`
        padding: 12px 24px;
        font-size: 15px;
        min-height: 48px;
        border-radius: 40px;
      `;

    default:
      return css``;
  }
};

export const StyledNewButton = styled.button<StyledNewButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: ${(props) => props.theme.font.default};
  font-weight: 800;
  line-height: 110%;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  border: none;
  outline: none;
  text-decoration: none;
  white-space: nowrap;
  user-select: none;
  box-sizing: border-box;

  ${(props) =>
    props.fullWidth &&
    css`
      width: 100%;
    `}

  ${(props) => getSizeStyles(props.size)}
  ${(props) => getButtonStyles(props.variant, props.state)}
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &:active {
    transform: scale(0.95);
  }

  &:focus-visible {
    outline: 2px solid ${(props) => props.theme.colors.main};
    outline-offset: 2px;
  }
`;
