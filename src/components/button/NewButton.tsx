import React, { ReactNode, ButtonHTMLAttributes } from "react";
import {
  StyledNewButton,
  ButtonVariant,
  ButtonSize,
  ButtonState,
} from "./StyledNewButton";

interface NewButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "size"> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  state?: ButtonState;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const NewButton: React.FC<NewButtonProps> = ({
  children,
  variant = ButtonVariant.FULFILLED,
  size = ButtonSize.MEDIUM,
  state = ButtonState.DEFAULT,
  fullWidth = false,
  loading = false,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}) => {
  const isDisabled = disabled || loading || state === ButtonState.DISABLED;
  const currentState = loading ? ButtonState.LOADING : state;

  return (
    <StyledNewButton
      variant={variant}
      size={size}
      state={currentState}
      fullWidth={fullWidth}
      disabled={isDisabled}
      {...props}
    >
      {leftIcon && <span>{leftIcon}</span>}
      {loading ? <span>Loading...</span> : children}
      {rightIcon && <span>{rightIcon}</span>}
    </StyledNewButton>
  );
};

export default NewButton;
export { ButtonVariant, ButtonSize, ButtonState };
