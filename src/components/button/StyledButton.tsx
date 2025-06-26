import styled from "styled-components";
import "@fontsource/manrope";

interface ButtonProps {
  size: string;
  buttonType: ButtonType;
}
export enum ButtonType {
  DEFAULT = "DEFAULT",
  FOLLOW = "FOLLOW",
  DELETE = "DELETE",
  OUTLINED = "OUTLINED",
  DISABLED = "DISABLED",
}
export const StyledButton = styled.button<ButtonProps>`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${(props) => {
      switch (props.size) {
        case "SMALL":
          return "6px 12px";
        case "MEDIUM":
          return "8px 16px";
        case "LARGE":
          return "10px 20px";
        default:
          return "8px 16px";
      }
    }};
    gap: 8px;
    margin-bottom: 8px;
    width: ${(props) => {
      switch (props.size) {
        case "SMALL":
          return "auto";
        case "MEDIUM":
          return "auto";
        case "LARGE":
          return "auto";
        default:
          return props.size; // For custom pixel values like "180px"
      }
    }};
    min-width: ${(props) => {
      switch (props.size) {
        case "SMALL":
          return "80px";
        case "MEDIUM":
          return "120px";
        case "LARGE":
          return "160px";
        default:
          return "auto";
      }
    }};
    height: ${(props) => {
      switch (props.size) {
        case "SMALL":
          return "32px";
        case "MEDIUM":
          return "40px";
        case "LARGE":
          return "48px";
        default:
          return "40px";
      }
    }};

    background: ${(props) => {
      switch (props.buttonType) {
        case "DEFAULT":
          return props.theme.colors.main;
        case "FOLLOW":
          return props.theme.colors.black;
        case "DELETE":
          return props.theme.colors.error;
        case "OUTLINED":
          return props.theme.colors.white;
        case "DISABLED":
          return props.theme.colors.light;
        default:
          return props.theme.colors.main;
      }
    }};
    border-radius: 40px;

    /* Button */
    font-family: ${(props) => props.theme.font.default};
    font-style: normal;
    font-weight: 800;
    font-size: 15px;
    line-height: 110%;

    border: ${(props) =>
      props.buttonType === "OUTLINED"
        ? `1px solid ${props.theme.colors.outline}`
        : "none"};

    color: ${(props) =>
      props.buttonType === "OUTLINED"
        ? props.theme.colors.black
        : props.theme.colors.white};

    text-align: center;

    cursor: pointer;

    transition: 0.3s;

    &:active {
        transform: scale(0.95);
    }

    &:hover {
        background: ${(props) => {
          switch (props.buttonType) {
            case ButtonType.DEFAULT:
              return props.theme.hover.default;
            case ButtonType.FOLLOW:
              return props.theme.hover.follow;
            case ButtonType.DELETE:
              return props.theme.hover.error;
            case ButtonType.OUTLINED:
              return props.theme.hover.outlined;
            case ButtonType.DISABLED:
              return props.theme.hover.disabled;
          }
        }}
`;
export default StyledButton;
