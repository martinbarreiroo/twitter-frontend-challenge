import React, { useState } from "react";
import { StyledContentContainer } from "./StyledContentContainer";
import Header from "../header/Header";
import TweetBox from "../../../../components/tweet-box/TweetBox";
import { StyledFeedContainer } from "./FeedContainer";
import ContentFeed from "../../../../components/feed/ContentFeed";
import { StyledContainer } from "../../../../components/common/Container";
import { FeedQueryContext } from "../header/tab-bar/TabBar";

const ContentContainer = () => {
  const [query, setQuery] = useState("");

  return (
    <FeedQueryContext.Provider value={{ query, setQuery }}>
      <StyledContentContainer>
        <Header />
        <StyledFeedContainer>
          <StyledContainer
            width={"100%"}
            padding={"16px"}
            borderBottom={"1px solid #ebeef0"}
          >
            <TweetBox />
          </StyledContainer>
          <StyledContainer minHeight={"66vh"} width={"100%"}>
            <ContentFeed query={query} />
          </StyledContainer>
        </StyledFeedContainer>
      </StyledContentContainer>
    </FeedQueryContext.Provider>
  );
};

export default ContentContainer;
