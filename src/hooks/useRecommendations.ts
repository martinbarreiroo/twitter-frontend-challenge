import { useQuery } from "@tanstack/react-query";
import { useHttpRequestService } from "../service/HttpRequestService";
import { queryKeys } from "./query-keys";

// Recommendations
export const useRecommendations = (limit = 10, skip = 0) => {
  const service = useHttpRequestService();
  return useQuery({
    queryKey: [...queryKeys.recommendations, limit, skip],
    queryFn: () => service.getRecommendedUsers(limit, skip),
  });
};

// Search
export const useSearchUsers = (query: string, limit = 10, skip = 0) => {
  const service = useHttpRequestService();
  return useQuery({
    queryKey: [...queryKeys.searchUsers(query), limit, skip],
    queryFn: () => service.searchUsers(query, limit, skip),
    enabled: !!query.trim(),
  });
};
