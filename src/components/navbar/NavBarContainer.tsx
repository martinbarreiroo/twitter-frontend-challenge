import styled from "styled-components";

export const StyledNavBarContainer = styled.div`
  display: flex;
  padding: 16px;
  flex: 0.5;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  border-right: 1px solid var(--grayscale-container-line, #f0f3f4);
  box-sizing: border-box;
  z-index: 1;
  .icon {
    display: flex;
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    border-radius: 32px;
  }

  .profile-info {
    display: flex;
    border-radius: 10px;
    width: fit-content;
    padding: 0 16px;
    &:hover {
      background-color: ${(props) => props.theme.colors.hover};
    }
  }

  @media (max-width: 1265px) {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    border-right: 1px solid var(--grayscale-container-line, #f0f3f4);
    margin-left: 2.5%;
  }

  @media (max-width: 600px) {
    background: ${(props) => props.theme.background};
    max-height: 56px;
    flex-direction: row;
    position: fixed;
    bottom: 0;
    border-right: none;
    border-top: 1px solid var(--grayscale-container-line, #f0f3f4);
    width: 100%;
    justify-content: center;
    padding: 0;
    margin-left: 0;

    .profile-info {
      display: none;
    }
  }
`;
