import styled from "styled-components";

export const StyledInputContainer = styled.div`
  border-radius: 8px;
  padding: 8px;
  border: 1px solid ${(props) => props.theme.colors.outline};
  transition: 0.3s;

  &.active-div {
    border: 1px solid ${(props) => props.theme.colors.main};
  }

  &.error {
    border: 1px solid ${(props) => props.theme.colors.error};
  }

  @media (min-width: 600px) {
    width: 337px;

    &.active-div {
      border: 1px solid ${(props) => props.theme.colors.main};
    }
  }
`;
