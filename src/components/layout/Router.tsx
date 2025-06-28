import React from "react";
import { createBrowserRouter, Outlet } from "react-router-dom";
import { StyledSideBarPageWrapper } from "../../pages/side-bar-page/SideBarPageWrapper";
import NavBar from "../navbar/NavBar";
import SignUpPage from "../../pages/auth/sign-up/SignUpPage";
import SignInPage from "../../pages/auth/sign-in/SignInPage";
import HomePage from "../../pages/home-page/HomePage";
import RecommendationPage from "../../pages/recommendation/RecommendationPage";
import ProfilePage from "../../pages/profile/ProfilePage";
import TweetPage from "../../pages/create-tweet-page/TweetPage";
import CommentPage from "../../pages/create-comment-page/CommentPage";
import PostPage from "../../pages/post-page/PostPage";
import MessagesPage from "../../pages/messages-page/MessagesPage";
import DedicatedChatPage from "../../pages/dedicated-chat-page/DedicatedChatPage";
import ProtectedRoute from "../protected-route/ProtectedRoute";
import PublicRoute from "../public-route/PublicRoute";

const WithNav = () => {
  return (
    <ProtectedRoute>
      <StyledSideBarPageWrapper>
        <NavBar />
        <Outlet />
      </StyledSideBarPageWrapper>
    </ProtectedRoute>
  );
};

export const ROUTER = createBrowserRouter([
  {
    path: "/sign-up",
    element: (
      <PublicRoute>
        <SignUpPage />
      </PublicRoute>
    ),
  },
  {
    path: "/sign-in",
    element: (
      <PublicRoute>
        <SignInPage />
      </PublicRoute>
    ),
  },
  {
    element: <WithNav />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/recommendations",
        element: <RecommendationPage />,
      },
      {
        path: "/profile/:id",
        element: <ProfilePage />,
      },
      {
        path: "/post/:id",
        element: <PostPage />,
      },
      {
        path: "/compose/tweet",
        element: <TweetPage />,
      },
      {
        path: "/compose/comment/:id",
        element: <CommentPage />,
      },
      {
        path: "/messages",
        element: <MessagesPage />,
      },
      {
        path: "/chat/:userId",
        element: <DedicatedChatPage />,
      },
      {
        path: "*",
        element: <HomePage />,
      },
    ],
  },
]);
