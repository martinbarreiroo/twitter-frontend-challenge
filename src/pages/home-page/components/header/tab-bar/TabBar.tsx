import React, { createContext, useContext, useState } from "react";
import Tab from "./tab/Tab";
import { useTranslation } from "react-i18next";
import { StyledTabBarContainer } from "./TabBarContainer";

// Create a context for the feed query
export const FeedQueryContext = createContext<{
  query: string;
  setQuery: (query: string) => void;
}>({
  query: "",
  setQuery: () => {},
});

export const useFeedQuery = () => useContext(FeedQueryContext);

interface TabBarProps {
  onQueryChange?: (query: string) => void;
}

const TabBar: React.FC<TabBarProps> = ({ onQueryChange }) => {
  const [activeFirstPage, setActiveFirstPage] = useState(true);
  const { t } = useTranslation();
  const { setQuery } = useFeedQuery();

  const handleClick = (value: boolean, queryValue: string) => {
    setActiveFirstPage(value);
    setQuery(queryValue);
    onQueryChange?.(queryValue);
  };

  return (
    <>
      <StyledTabBarContainer>
        <Tab
          active={activeFirstPage}
          text={t("header.for-you")}
          onClick={() => handleClick(true, "")}
        />
        <Tab
          active={!activeFirstPage}
          text={t("header.following")}
          onClick={() => handleClick(false, "following")}
        />
      </StyledTabBarContainer>
    </>
  );
};

export default TabBar;
