import styled from "styled-components";

export const StyledFeedContainer = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  width: 100%;
  height: 100%;
  scrollbar-width: none;

  /* Hide scrollbar for Chrome, Safari and Opera */
  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 600px) {
    margin-bottom: 48px;
  }
`;
