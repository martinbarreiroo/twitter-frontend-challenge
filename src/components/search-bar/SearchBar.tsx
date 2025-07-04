import React, { ChangeEvent, useState, useEffect } from "react";
import SearchResultModal from "./search-result-modal/SearchResultModal";
import { useSearchUsers } from "../../hooks";
import { useTranslation } from "react-i18next";
import { StyledSearchBarContainer } from "./SearchBarContainer";
import { StyledSearchBarInput } from "./SearchBarInput";
import { useClickOutside } from "../../hooks";

export const SearchBar = () => {
  const [query, setQuery] = useState<string>("");
  const [debouncedQuery, setDebouncedQuery] = useState<string>("");
  const { data: results = [] } = useSearchUsers(debouncedQuery, 4, 0);
  const { t } = useTranslation();

  // Use click outside hook to close the search results
  const searchRef = useClickOutside<HTMLDivElement>(() => {
    if (query.length > 0) {
      setQuery("");
      setDebouncedQuery("");
    }
  });

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  return (
    <StyledSearchBarContainer ref={searchRef}>
      <StyledSearchBarInput
        onChange={handleChange}
        value={query}
        placeholder={t("placeholder.search")}
      />
      <SearchResultModal show={query.length > 0} results={results} />
    </StyledSearchBarContainer>
  );
};
