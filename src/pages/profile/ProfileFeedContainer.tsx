import styled from "styled-components";

export const StyledProfileFeedContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  height: calc(100vh - 280px);
  overflow-y: auto;
  scrollbar-width: none;

  /* Hide scrollbar for Chrome, Safari and Opera */
  &::-webkit-scrollbar {
    display: none;
  }

  /* Hide scrollbar for IE, Edge and Firefox */
  -ms-overflow-style: none;
  scrollbar-width: none;

  @media (max-width: 600px) {
    height: calc(100vh - 200px);
    margin-bottom: 48px;
  }
`;
