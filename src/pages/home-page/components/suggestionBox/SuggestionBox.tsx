import React from "react";
import FollowUserBox from "../../../../components/follow-user/FollowUserBox";
import { useRecommendations } from "../../../../hooks";
import { useTranslation } from "react-i18next";
import { StyledSuggestionBoxContainer } from "./SuggestionBoxContainer";
import { User } from "../../../../service";

const SuggestionBox = () => {
  const { data: users = [] } = useRecommendations(6, 0);
  const { t } = useTranslation();
  const bucketUrl = process.env.REACT_APP_BUCKET_URL;

  return (
    <StyledSuggestionBoxContainer>
      <h6>{t("suggestion.who-to-follow")}</h6>
      {users.length > 0 ? (
        users
          .filter((value: User, index: number, array: User[]) => {
            return array.indexOf(value) === index;
          })
          .slice(0, 5)
          .map((user: User) => (
            <FollowUserBox
              key={user.id}
              id={user.id}
              name={user.name}
              username={user.username}
              profilePicture={
                user.profilePicture && bucketUrl
                  ? `${bucketUrl}/${user.profilePicture}`
                  : undefined
              }
            />
          ))
      ) : (
        <p>{t("suggestion.no-recommendations")}</p>
      )}
      {users.length > 5 && (
        <a href="/recommendations">{t("suggestion.show-more")}</a>
      )}
    </StyledSuggestionBoxContainer>
  );
};

export default SuggestionBox;
