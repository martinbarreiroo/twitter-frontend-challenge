import React, { useState } from "react";
import NavItem from "./navItem/NavItem";
import Button from "../button/Button";
import { useLocation, useNavigate } from "react-router-dom";
import { StyledTweetButton } from "../tweet-button/StyledTweetButton";
import TweetModal from "../tweet-modal/TweetModal";
import { IconType, LogoIcon } from "../icon/Icon";
import { useTranslation } from "react-i18next";
import { ButtonType } from "../button/StyledButton";
import { StyledNavBarContainer } from "./NavBarContainer";
import { StyledContainer } from "../common/Container";
import { StyledIconContainer } from "./IconContainer";
import { StyledNavItemsContainer } from "./navItem/NavItemsContainer";
import { useAuth } from "../../contexts/AuthContext";
import { useUnreadCount } from "../../hooks/useChats";
import ProfileLogoutPrompt from "../profile-logout/ProfileLogoutPrompt";
import styled from "styled-components";

const StyledBadge = styled.div`
  position: absolute;
  top: -8px;
  right: -8px;
  background: ${(props) => props.theme.colors.main};
  color: white;
  border-radius: 50%;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: bold;
  z-index: 1;
`;

const NavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [tweetModalOpen, setTweetModalOpen] = useState(false);
  const { user } = useAuth();
  const { data: unreadData } = useUnreadCount();
  const { t } = useTranslation();

  const unreadCount = unreadData?.count || 0;

  return (
    <StyledNavBarContainer>
      <StyledContainer flex={1}>
        <StyledIconContainer>
          <LogoIcon />
        </StyledIconContainer>
        <StyledNavItemsContainer>
          <NavItem
            title={t("navbar.home")}
            onClick={() => {
              navigate("/");
            }}
            icon={IconType.HOME}
            selectedIcon={IconType.ACTIVE_HOME}
            active={location.pathname === "/"}
          />
          <NavItem
            title={t("navbar.messages")}
            onClick={() => {
              navigate("/messages");
            }}
            icon={IconType.MESSAGE}
            selectedIcon={IconType.ACTIVE_MESSAGE}
            active={location.pathname.startsWith("/messages")}
          />
          {unreadCount > 0 && (
            <StyledBadge>{unreadCount > 99 ? "99+" : unreadCount}</StyledBadge>
          )}
          <NavItem
            title={t("navbar.profile")}
            onClick={() => {
              navigate(`/profile/${user?.id}`);
            }}
            icon={IconType.PROFILE}
            selectedIcon={IconType.ACTIVE_PROFILE}
            active={location.pathname === `/profile/${user?.id}`}
          />
          <StyledTweetButton onClick={() => navigate("/compose/tweet")}>
            +
          </StyledTweetButton>
        </StyledNavItemsContainer>
        <StyledContainer width={"100%"}>
          <Button
            text={"Tweet"}
            size={"180px"}
            buttonType={ButtonType.DEFAULT}
            onClick={() => {
              setTweetModalOpen(true);
            }}
          ></Button>
        </StyledContainer>
        <TweetModal
          open={tweetModalOpen}
          onClose={() => {
            setTweetModalOpen(false);
          }}
        />
      </StyledContainer>
      <ProfileLogoutPrompt margin={"50px 0"} direction={"column-reverse"} />
    </StyledNavBarContainer>
  );
};

export default NavBar;
