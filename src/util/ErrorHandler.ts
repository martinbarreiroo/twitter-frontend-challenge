// Global error handler utility
// This is used to avoid circular dependencies when setting up global error handling

export const createGlobalErrorHandler = (
  showToast: (message: string, type: string) => void
) => {
  return (error: any) => {
    // Don't show toast for auth errors (401) as they're handled by redirect
    if (error?.response?.status === 401) return;

    // Don't show toast for network errors that might be transient
    if (error?.code === "NETWORK_ERROR") return;

    // Show a generic error message for other failures
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "An unexpected error occurred. Please try again.";

    showToast(message, "ALERT");
  };
};

export const isNetworkError = (error: any): boolean => {
  return !error?.response && error?.code === "NETWORK_ERROR";
};

export const isServerError = (error: any): boolean => {
  return error?.response?.status >= 500;
};

export const isClientError = (error: any): boolean => {
  return error?.response?.status >= 400 && error?.response?.status < 500;
};
