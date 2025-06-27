import { useCallback, useRef } from "react";
import { Post } from "../../service";
import { StyledContainer } from "../common/Container";
import Tweet from "../tweet/Tweet";
import Loader from "../loader/Loader";

interface InfiniteFeedProps {
  posts: Post[];
  loading: boolean;
  hasNextPage?: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage?: boolean;
}

const InfiniteFeed = ({
  posts,
  loading,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
}: InfiniteFeedProps) => {
  const observer = useRef<IntersectionObserver | null>(null);

  const lastTweetRef = useCallback(
    (node: Element | null) => {
      if (loading || isFetchingNextPage) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  const uniquePosts: Post[] = posts.filter((post, index, self) => {
    return self.findIndex((p) => p.id === post.id) === index;
  });

  return (
    <StyledContainer width={"100%"} alignItems={"center"}>
      {uniquePosts.map((post: Post, index: number) => {
        if (uniquePosts.length === index + 1) {
          return (
            <div ref={lastTweetRef} key={post.id} style={{ width: "100%" }}>
              <Tweet post={post} />
            </div>
          );
        }
        return <Tweet key={post.id} post={post} />;
      })}
      {(loading || isFetchingNextPage) && <Loader />}
    </StyledContainer>
  );
};

export default InfiniteFeed;
