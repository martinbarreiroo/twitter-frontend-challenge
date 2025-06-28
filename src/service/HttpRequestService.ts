import type { PostData, SingInData, SingUpData, CommentData } from "./index";
import axios, { AxiosInstance, AxiosError } from "axios";

const url =
  process.env.REACT_APP_API_URL || "https://twitter-ieea.onrender.com/api";

// Create axios instance with common configuration
const api: AxiosInstance = axios.create({
  baseURL: url,
});

// Request interceptor to add authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/sign-in";
    }
    return Promise.reject(error);
  }
);

const httpRequestService = {
  signUp: async (data: Partial<SingUpData>) => {
    const res = await axios.post(`${url}/auth/signup`, data);
    if (res.status === 201) {
      localStorage.setItem("token", `Bearer ${res.data.token}`);
      return true;
    }
  },
  signIn: async (data: SingInData) => {
    const res = await axios.post(`${url}/auth/login`, data);
    if (res.status === 200) {
      localStorage.setItem("token", `Bearer ${res.data.token}`);
      return true;
    }
  },
  createPost: async (data: PostData) => {
    try {
      let imageKeys: string[] = [];
      console.log("files", data.images);

      // Step 1: If there are images, get upload URLs
      if (data.images && data.images.length > 0) {
        const imageRequests = data.images.map((file) => {
          // Handle case where file might be wrapped in an object
          const actualFile = (file as any).fileExtension || file;
          return {
            fileExtension: actualFile.name
              ? actualFile.name.split(".").pop()
              : "jpg",
            contentType: actualFile.type || "image/jpeg",
          };
        });

        const uploadUrlResponse = await api.post(`/post/images/upload-urls`, {
          images: imageRequests,
        });

        if (uploadUrlResponse.status === 200) {
          const uploadData = uploadUrlResponse.data;
          console.log("Upload URL Response:", uploadData);

          // Step 2: Upload each image to S3 using presigned URLs
          for (let i = 0; i < data.images.length; i++) {
            const file = data.images[i];
            const actualFile = (file as any).fileExtension || file;

            // Access the uploads array from the response
            const uploadInfo = uploadData.uploads[i];
            console.log("Upload info for image", i, ":", uploadInfo);

            if (!uploadInfo || !uploadInfo.uploadUrl || !uploadInfo.imageKey) {
              throw new Error(
                `Invalid upload data for image ${i + 1}: ${JSON.stringify(
                  uploadInfo
                )}`
              );
            }

            const { uploadUrl, imageKey } = uploadInfo;

            const uploadResponse = await fetch(uploadUrl, {
              method: "PUT",
              body: actualFile,
            });

            if (!uploadResponse.ok) {
              throw new Error(`Failed to upload image ${i + 1}`);
            }

            imageKeys.push(imageKey);
          }
        }
      }

      // Step 3: Create post with image keys
      const postData = {
        content: data.content,
        parentId: data.parentId,
        images: imageKeys,
      };

      const res = await api.post(`/post`, postData);

      if (res.status === 201) {
        return res.data;
      }
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  },

  createComment: async (postId: string, data: CommentData) => {
    const res = await api.post(`/comment/${postId}`, data);
    return res.status === 201 ? res.data : null;
  },
  getImageUploadUrls: async (endpoint: string, data: any) => {
    const res = await api.post(`/${endpoint}`, data);
    if (res.status === 200) {
      return res.data;
    }
  },

  getPaginatedPosts: async (limit: number, after: string, query: string) => {
    const res = await api.get(`/post`, {
      params: {
        limit,
        after,
      },
    });
    if (res.status === 200) {
      return res.data;
    }
  },
  getPosts: async (query: string) => {
    const res = await api.get(`/post`);
    if (res.status === 200) {
      return res.data;
    }
  },
  getRecommendedUsers: async (limit: number, skip: number) => {
    const res = await api.get(`/user`, {
      params: {
        limit,
        skip,
      },
    });
    if (res.status === 200) {
      return res.data;
    }
  },
  me: async () => {
    const res = await api.get(`/user/me`);
    if (res.status === 200) {
      return res.data;
    }
  },
  getPostById: async (id: string) => {
    const res = await api.get(`/post/${id}`);
    if (res.status === 200) {
      return res.data;
    }
  },
  createReaction: async (postId: string, reaction: string) => {
    const res = await api.post(`/reaction/${postId}`, { type: reaction });
    if (res.status === 201) {
      return res.data;
    }
  },
  deleteReaction: async (reactionId: string) => {
    const res = await api.delete(`/reaction/${reactionId}`);
    if (res.status === 200) {
      return res.data;
    }
  },
  deleteReactionByPost: async (postId: string, type: string) => {
    const res = await api.delete(`/reaction/${postId}/${type}`);
    if (res.status === 200) {
      return res.data;
    }
  },
  followUser: async (userId: string) => {
    const res = await api.post(`/follower/follow/${userId}`, {});
    if (res.status === 201) {
      return res.data;
    }
  },
  unfollowUser: async (userId: string) => {
    const res = await api.post(`/follower/unfollow/${userId}`, {});
    if (res.status === 201) {
      return res.data;
    }
  },
  searchUsers: async (username: string, limit: number, skip: number) => {
    try {
      const cancelToken = axios.CancelToken.source();

      const response = await api.get(`/user/by_username/${username}`, {
        params: {
          limit,
          skip,
        },
        cancelToken: cancelToken.token,
      });

      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      if (!axios.isCancel(error)) console.log(error);
    }
  },

  getProfile: async (id: string) => {
    const res = await api.get(`/user/${id}`);
    if (res.status === 200) {
      return res.data;
    }
  },
  getPaginatedPostsFromProfile: async (
    limit: number,
    after: string,
    id: string
  ) => {
    const res = await api.get(`/post/by_user/${id}`, {
      params: {
        limit,
        after,
      },
    });

    if (res.status === 200) {
      return res.data;
    }
  },
  getPostsFromProfile: async (id: string) => {
    const res = await api.get(`/post/by_user/${id}`);

    if (res.status === 200) {
      return res.data;
    }
  },

  isLogged: async () => {
    try {
      const res = await api.get(`/user/me`);
      return res.status === 200;
    } catch (error) {
      return false;
    }
  },

  getProfileView: async (id: string) => {
    const res = await api.get(`/user/${id}`);

    if (res.status === 200) {
      return res.data;
    }
  },

  deleteProfile: async () => {
    const res = await api.delete(`/user/me`);

    if (res.status === 204) {
      localStorage.removeItem("token");
    }
  },

  getChats: async () => {
    const res = await api.get(`/chat`);

    if (res.status === 200) {
      return res.data;
    }
  },

  // New chat endpoints based on backend implementation
  getConversations: async () => {
    const res = await api.get(`/chat/conversations`);
    if (res.status === 200) {
      return res.data;
    }
  },

  getConversation: async (
    partnerId: string,
    options?: { limit?: number; before?: string; after?: string }
  ) => {
    const res = await api.get(`/chat/conversation/${partnerId}`, {
      params: options,
    });
    if (res.status === 200) {
      return res.data;
    }
  },

  sendMessage: async (receiverId: string, content: { content: string }) => {
    const res = await api.post(`/chat/send/${receiverId}`, content);
    if (res.status === 201) {
      return res.data;
    }
  },

  markMessagesAsRead: async (data: { conversationPartnerId: string }) => {
    const res = await api.post(`/chat/mark-read`, data);
    if (res.status === 200) {
      return res.data;
    }
  },

  getUnreadCount: async () => {
    const res = await api.get(`/chat/unread-count`);
    if (res.status === 200) {
      return res.data;
    }
  },

  canChat: async (partnerId: string) => {
    const res = await api.get(`/chat/can-chat/${partnerId}`);
    if (res.status === 200) {
      return res.data;
    }
  },

  getMutualFollows: async () => {
    const res = await api.get(`/follow/mutual`);

    if (res.status === 200) {
      return res.data;
    }
  },

  createChat: async (id: string) => {
    const res = await api.post(`/chat`, {
      users: [id],
    });

    if (res.status === 201) {
      return res.data;
    }
  },

  getChat: async (id: string) => {
    const res = await api.get(`/chat/${id}`);

    if (res.status === 200) {
      return res.data;
    }
  },

  deletePost: async (id: string) => {
    await api.delete(`/post/${id}`);
  },

  getPaginatedCommentsByPostId: async (
    id: string,
    limit: number,
    after: string
  ) => {
    const res = await api.get(`/comment/${id}`, {
      params: {
        limit,
        after,
      },
    });
    if (res.status === 200) {
      return res.data;
    }
  },
  getCommentsByPostId: async (id: string | undefined) => {
    const res = await api.get(`/comment/${id}`);
    if (res.status === 200) {
      return res.data;
    }
  },
};

const useHttpRequestService = () => httpRequestService;

// For class component (remove when unused)
class HttpService {
  service = httpRequestService;
}

export { useHttpRequestService, HttpService };
