// Centralized query keys for consistent caching
export const queryKeys = {
  posts: ["posts"] as const,
  post: (id: string) => ["post", id] as const,
  comments: (postId: string) => ["comments", postId] as const,
  profile: (id: string) => ["profile", id] as const,
  recommendations: ["recommendations"] as const,
  searchUsers: (query: string) => ["searchUsers", query] as const,
  user: ["user"] as const,
  chats: ["chats"] as const,
  chat: (id: string) => ["chat", id] as const,
};
