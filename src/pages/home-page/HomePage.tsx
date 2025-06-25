import React from "react";
import SuggestionBox from "./components/suggestionBox/SuggestionBox";
import ContentContainer from "./components/contentContainer/ContentContainer";
import { SearchBar } from "../../components/search-bar/SearchBar";
import { StyledUserSuggestionContainer } from "./UserSeuggestionContainer";

const HomePage = () => {
  return (
    <>
      <ContentContainer />
      <StyledUserSuggestionContainer>
        <SearchBar />
        <SuggestionBox />
      </StyledUserSuggestionContainer>
    </>
  );
};

export default HomePage;
