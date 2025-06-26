import React, {
  InputHTMLAttributes,
  ReactNode,
  useState,
  forwardRef,
} from "react";
import {
  StyledNewInput,
  StyledInputContainer,
  StyledInputLabel,
  StyledInputHelperText,
  InputVariant,
  InputSize,
  InputState,
} from "./StyledNewInput";

interface NewInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  variant?: InputVariant;
  size?: InputSize;
  state?: InputState;
  fullWidth?: boolean;
  label?: string;
  helperText?: string;
  error?: string;
  success?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const NewInput = forwardRef<HTMLInputElement, NewInputProps>(
  (
    {
      variant = InputVariant.OUTLINED,
      size = InputSize.MEDIUM,
      state,
      fullWidth = false,
      label,
      helperText,
      error,
      success,
      leftIcon,
      rightIcon,
      onFocus,
      onBlur,
      disabled,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    // Determine the current state
    const getCurrentState = (): InputState => {
      if (disabled) return InputState.DISABLED;
      if (error) return InputState.ERROR;
      if (success) return InputState.SUCCESS;
      if (isFocused) return InputState.FOCUS;
      if (state) return state;
      return InputState.DEFAULT;
    };

    const currentState = getCurrentState();

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    // Determine helper text to show
    const getHelperText = () => {
      if (error) return error;
      if (success) return success;
      return helperText;
    };

    const displayHelperText = getHelperText();

    return (
      <StyledInputContainer fullWidth={fullWidth}>
        {label && (
          <StyledInputLabel $size={size} state={currentState}>
            {label}
          </StyledInputLabel>
        )}

        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
          }}
        >
          {leftIcon && (
            <span
              style={{
                position: "absolute",
                left: "12px",
                zIndex: 1,
                color:
                  currentState === InputState.DISABLED ? "#566370" : "#000",
              }}
            >
              {leftIcon}
            </span>
          )}

          <StyledNewInput
            ref={ref}
            variant={variant}
            $size={size}
            state={currentState}
            fullWidth={fullWidth}
            disabled={disabled}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={{
              paddingLeft: leftIcon ? "40px" : undefined,
              paddingRight: rightIcon ? "40px" : undefined,
            }}
            {...props}
          />

          {rightIcon && (
            <span
              style={{
                position: "absolute",
                right: "12px",
                zIndex: 1,
                color:
                  currentState === InputState.DISABLED ? "#566370" : "#000",
              }}
            >
              {rightIcon}
            </span>
          )}
        </div>

        {displayHelperText && (
          <StyledInputHelperText $size={size} state={currentState}>
            {displayHelperText}
          </StyledInputHelperText>
        )}
      </StyledInputContainer>
    );
  }
);

NewInput.displayName = "NewInput";

export default NewInput;
export { InputVariant, InputSize, InputState };
