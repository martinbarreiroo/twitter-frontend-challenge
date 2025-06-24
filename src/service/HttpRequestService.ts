import type { PostData, SingInData, SingUpData, CommentData } from "./index";
import axios from "axios";

const url =
  process.env.REACT_APP_API_URL || "https://twitter-ieea.onrender.com/api";

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

        const uploadUrlResponse = await axios.post(
          `${url}/post/images/upload-urls`,
          {
            images: imageRequests,
          },
          {
            headers: {
              Authorization: localStorage.getItem("token"),
            },
          }
        );

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

      const res = await axios.post(`${url}/post`, postData, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });

      if (res.status === 201) {
        return res.data;
      }
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  },

  createComment: async (postId: string, data: CommentData) => {
    const res = await axios.post(`${url}/comment/${postId}`, data, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
    return res.status === 201 ? res.data : null;
  },
  getImageUploadUrls: async (endpoint: string, data: any) => {
    const res = await axios.post(`${url}/${endpoint}`, data, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
    if (res.status === 200) {
      return res.data;
    }
  },

  getPaginatedPosts: async (limit: number, after: string, query: string) => {
    const res = await axios.get(`${url}/post`, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
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
    const res = await axios.get(`${url}/post`, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
    if (res.status === 200) {
      return res.data;
    }
  },
  getRecommendedUsers: async (limit: number, skip: number) => {
    const res = await axios.get(`${url}/user`, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
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
    const res = await axios.get(`${url}/user/me`, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
    if (res.status === 200) {
      return res.data;
    }
  },
  getPostById: async (id: string) => {
    const res = await axios.get(`${url}/post/${id}`, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
    if (res.status === 200) {
      return res.data;
    }
  },
  createReaction: async (postId: string, reaction: string) => {
    const res = await axios.post(
      `${url}/reaction/${postId}`,
      { type: reaction },
      {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      }
    );
    if (res.status === 201) {
      return res.data;
    }
  },
  deleteReaction: async (reactionId: string) => {
    const res = await axios.delete(`${url}/reaction/${reactionId}`, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
    if (res.status === 200) {
      return res.data;
    }
  },
  deleteReactionByPost: async (postId: string, type: string) => {
    const res = await axios.delete(`${url}/reaction/${postId}/${type}`, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
    if (res.status === 200) {
      return res.data;
    }
  },
  followUser: async (userId: string) => {
    const res = await axios.post(
      `${url}/follower/follow/${userId}`,
      {},
      {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      }
    );
    if (res.status === 201) {
      return res.data;
    }
  },
  unfollowUser: async (userId: string) => {
    const res = await axios.post(
      `${url}/follower/unfollow/${userId}`,
      {},
      {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      }
    );
    if (res.status === 201) {
      return res.data;
    }
  },
  searchUsers: async (username: string, limit: number, skip: number) => {
    try {
      const cancelToken = axios.CancelToken.source();

      const response = await axios.get(`${url}/user/by_username/${username}`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
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
    const res = await axios.get(`${url}/user/profile/${id}`, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
    if (res.status === 200) {
      return res.data;
    }
  },
  getPaginatedPostsFromProfile: async (
    limit: number,
    after: string,
    id: string
  ) => {
    const res = await axios.get(`${url}/post/by_user/${id}`, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
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
    const res = await axios.get(`${url}/post/by_user/${id}`, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });

    if (res.status === 200) {
      return res.data;
    }
  },

  isLogged: async () => {
    const res = await axios.get(`${url}/user/me`, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
    return res.status === 200;
  },

  getProfileView: async (id: string) => {
    const res = await axios.get(`${url}/user/${id}`, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });

    if (res.status === 200) {
      return res.data;
    }
  },

  deleteProfile: async () => {
    const res = await axios.delete(`${url}/user/me`, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });

    if (res.status === 204) {
      localStorage.removeItem("token");
    }
  },

  getChats: async () => {
    const res = await axios.get(`${url}/chat`, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });

    if (res.status === 200) {
      return res.data;
    }
  },

  getMutualFollows: async () => {
    const res = await axios.get(`${url}/follow/mutual`, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });

    if (res.status === 200) {
      return res.data;
    }
  },

  createChat: async (id: string) => {
    const res = await axios.post(
      `${url}/chat`,
      {
        users: [id],
      },
      {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      }
    );

    if (res.status === 201) {
      return res.data;
    }
  },

  getChat: async (id: string) => {
    const res = await axios.get(`${url}/chat/${id}`, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });

    if (res.status === 200) {
      return res.data;
    }
  },

  deletePost: async (id: string) => {
    await axios.delete(`${url}/post/${id}`, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
  },

  getPaginatedCommentsByPostId: async (
    id: string,
    limit: number,
    after: string
  ) => {
    const res = await axios.get(`${url}/comment/${id}`, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
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
    const res = await axios.get(`${url}/comment/${id}`, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
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
