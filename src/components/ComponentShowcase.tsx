import React, { useState } from "react";
import { StyledContainer } from "./common/Container";
import { NewButton, ButtonVariant, ButtonSize, ButtonState } from "./button";
import { NewInput, InputVariant, InputSize, InputState } from "./input";

const ComponentShowcase: React.FC = () => {
  const [inputValue, setInputValue] = useState("");

  return (
    <StyledContainer padding="24px" gap="32px">
      <h1>New Components Showcase</h1>

      {/* Button Variants */}
      <StyledContainer gap="16px">
        <h2>Button Variants</h2>
        <StyledContainer gap="8px" flexDirection="row" flexWrap="wrap">
          <NewButton variant={ButtonVariant.OUTLINED} size={ButtonSize.SMALL}>
            Outlined Small
          </NewButton>
          <NewButton variant={ButtonVariant.FULFILLED} size={ButtonSize.SMALL}>
            Fulfilled Small
          </NewButton>
          <NewButton variant={ButtonVariant.GHOST} size={ButtonSize.SMALL}>
            Ghost Small
          </NewButton>
          <NewButton variant={ButtonVariant.WHITE} size={ButtonSize.SMALL}>
            White Small
          </NewButton>
        </StyledContainer>

        <StyledContainer gap="8px" flexDirection="row" flexWrap="wrap">
          <NewButton variant={ButtonVariant.OUTLINED} size={ButtonSize.MEDIUM}>
            Outlined Medium
          </NewButton>
          <NewButton variant={ButtonVariant.FULFILLED} size={ButtonSize.MEDIUM}>
            Fulfilled Medium
          </NewButton>
          <NewButton variant={ButtonVariant.GHOST} size={ButtonSize.MEDIUM}>
            Ghost Medium
          </NewButton>
          <NewButton variant={ButtonVariant.WHITE} size={ButtonSize.MEDIUM}>
            White Medium
          </NewButton>
        </StyledContainer>

        <StyledContainer gap="8px" flexDirection="row" flexWrap="wrap">
          <NewButton variant={ButtonVariant.OUTLINED} size={ButtonSize.LARGE}>
            Outlined Large
          </NewButton>
          <NewButton variant={ButtonVariant.FULFILLED} size={ButtonSize.LARGE}>
            Fulfilled Large
          </NewButton>
          <NewButton variant={ButtonVariant.GHOST} size={ButtonSize.LARGE}>
            Ghost Large
          </NewButton>
          <NewButton variant={ButtonVariant.WHITE} size={ButtonSize.LARGE}>
            White Large
          </NewButton>
        </StyledContainer>
      </StyledContainer>

      {/* Button States */}
      <StyledContainer gap="16px">
        <h2>Button States</h2>
        <StyledContainer gap="8px" flexDirection="row" flexWrap="wrap">
          <NewButton variant={ButtonVariant.FULFILLED}>Default</NewButton>
          <NewButton variant={ButtonVariant.FULFILLED} disabled>
            Disabled
          </NewButton>
          <NewButton variant={ButtonVariant.FULFILLED} loading>
            Loading
          </NewButton>
        </StyledContainer>
      </StyledContainer>

      {/* Input Variants */}
      <StyledContainer gap="16px">
        <h2>Input Variants</h2>
        <StyledContainer gap="16px" maxWidth="400px">
          <NewInput
            variant={InputVariant.OUTLINED}
            size={InputSize.SMALL}
            label="Outlined Small"
            placeholder="Enter text..."
            helperText="This is a helper text"
          />
          <NewInput
            variant={InputVariant.FULFILLED}
            size={InputSize.MEDIUM}
            label="Fulfilled Medium"
            placeholder="Enter text..."
          />
          <NewInput
            variant={InputVariant.GHOST}
            size={InputSize.LARGE}
            label="Ghost Large"
            placeholder="Enter text..."
          />
          <NewInput
            variant={InputVariant.WHITE}
            size={InputSize.MEDIUM}
            label="White Medium"
            placeholder="Enter text..."
          />
        </StyledContainer>
      </StyledContainer>

      {/* Input States */}
      <StyledContainer gap="16px">
        <h2>Input States</h2>
        <StyledContainer gap="16px" maxWidth="400px">
          <NewInput
            variant={InputVariant.OUTLINED}
            label="Default State"
            placeholder="Enter text..."
            value={inputValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setInputValue(e.target.value)
            }
          />
          <NewInput
            variant={InputVariant.OUTLINED}
            label="Error State"
            placeholder="Enter text..."
            error="This field is required"
            value=""
          />
          <NewInput
            variant={InputVariant.OUTLINED}
            label="Success State"
            placeholder="Enter text..."
            success="Looks good!"
            value="Valid input"
          />
          <NewInput
            variant={InputVariant.OUTLINED}
            label="Disabled State"
            placeholder="Enter text..."
            disabled
            value="Cannot edit"
          />
        </StyledContainer>
      </StyledContainer>

      {/* Full Width Examples */}
      <StyledContainer gap="16px">
        <h2>Full Width Examples</h2>
        <NewButton variant={ButtonVariant.FULFILLED} fullWidth>
          Full Width Button
        </NewButton>
        <NewInput
          variant={InputVariant.OUTLINED}
          label="Full Width Input"
          placeholder="This input takes full width..."
          fullWidth
        />
      </StyledContainer>
    </StyledContainer>
  );
};

export default ComponentShowcase;
