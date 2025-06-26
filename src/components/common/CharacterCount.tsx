import React from "react";
import styled from "styled-components";

const StyledCharacterCount = styled.div<{ isOverLimit: boolean }>`
  font-size: 12px;
  font-family: "Manrope", sans-serif;
  color: ${(props) =>
    props.isOverLimit ? props.theme.colors.error : props.theme.colors.text};
  margin-left: 8px;
  line-height: 110%;
  letter-spacing: -0.12px;
`;

interface CharacterCountProps {
  current: number;
  max: number;
}

const CharacterCount = ({ current, max }: CharacterCountProps) => {
  const isOverLimit: boolean = current > max;

  return (
    <StyledCharacterCount isOverLimit={isOverLimit}>
      {current}/{max}
    </StyledCharacterCount>
  );
};

export default CharacterCount;
