import { 
  createGlobalErrorHandler,
  isNetworkError,
  isServerError,
  isClientError
} from '../../src/util/ErrorHandler';

describe('ErrorHandler', () => {
  let mockShowToast: jest.Mock;

  beforeEach(() => {
    mockShowToast = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createGlobalErrorHandler', () => {
    it('should not show toast for 401 auth errors', () => {
      const errorHandler = createGlobalErrorHandler(mockShowToast);
      
      const authError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      };

      errorHandler(authError);

      expect(mockShowToast).not.toHaveBeenCalled();
    });

    it('should not show toast for network errors', () => {
      const errorHandler = createGlobalErrorHandler(mockShowToast);
      
      const networkError = {
        code: 'NETWORK_ERROR',
        message: 'Network failed'
      };

      errorHandler(networkError);

      expect(mockShowToast).not.toHaveBeenCalled();
    });

    it('should show toast with response error message', () => {
      const errorHandler = createGlobalErrorHandler(mockShowToast);
      
      const serverError = {
        response: {
          status: 500,
          data: { message: 'Internal server error' }
        }
      };

      errorHandler(serverError);

      expect(mockShowToast).toHaveBeenCalledWith('Internal server error', 'ALERT');
    });

    it('should show toast with generic error message', () => {
      const errorHandler = createGlobalErrorHandler(mockShowToast);
      
      const genericError = {
        message: 'Something went wrong'
      };

      errorHandler(genericError);

      expect(mockShowToast).toHaveBeenCalledWith('Something went wrong', 'ALERT');
    });

    it('should show default message when no error message is available', () => {
      const errorHandler = createGlobalErrorHandler(mockShowToast);
      
      const unknownError = {};

      errorHandler(unknownError);

      expect(mockShowToast).toHaveBeenCalledWith(
        'An unexpected error occurred. Please try again.',
        'ALERT'
      );
    });

    it('should prioritize response data message over generic message', () => {
      const errorHandler = createGlobalErrorHandler(mockShowToast);
      
      const errorWithBothMessages = {
        message: 'Generic error',
        response: {
          status: 400,
          data: { message: 'Validation failed' }
        }
      };

      errorHandler(errorWithBothMessages);

      expect(mockShowToast).toHaveBeenCalledWith('Validation failed', 'ALERT');
    });
  });

  describe('isNetworkError', () => {
    it('should return true for network errors', () => {
      const networkError = {
        code: 'NETWORK_ERROR'
      };

      expect(isNetworkError(networkError)).toBe(true);
    });

    it('should return false for errors with responses', () => {
      const responseError = {
        response: { status: 404 },
        code: 'NETWORK_ERROR'
      };

      expect(isNetworkError(responseError)).toBe(false);
    });

    it('should return false for errors without NETWORK_ERROR code', () => {
      const otherError = {
        code: 'OTHER_ERROR'
      };

      expect(isNetworkError(otherError)).toBe(false);
    });

    it('should return false for null/undefined errors', () => {
      expect(isNetworkError(null)).toBe(false);
      expect(isNetworkError(undefined)).toBe(false);
    });
  });

  describe('isServerError', () => {
    it('should return true for 500+ status codes', () => {
      const serverError = {
        response: { status: 500 }
      };

      expect(isServerError(serverError)).toBe(true);

      const anotherServerError = {
        response: { status: 503 }
      };

      expect(isServerError(anotherServerError)).toBe(true);
    });

    it('should return false for status codes below 500', () => {
      const clientError = {
        response: { status: 404 }
      };

      expect(isServerError(clientError)).toBe(false);
    });

    it('should return false for errors without response', () => {
      const networkError = {
        code: 'NETWORK_ERROR'
      };

      expect(isServerError(networkError)).toBe(false);
    });

    it('should return false for null/undefined errors', () => {
      expect(isServerError(null)).toBe(false);
      expect(isServerError(undefined)).toBe(false);
    });
  });

  describe('isClientError', () => {
    it('should return true for 400-499 status codes', () => {
      const badRequestError = {
        response: { status: 400 }
      };

      expect(isClientError(badRequestError)).toBe(true);

      const notFoundError = {
        response: { status: 404 }
      };

      expect(isClientError(notFoundError)).toBe(true);

      const unauthorizedError = {
        response: { status: 401 }
      };

      expect(isClientError(unauthorizedError)).toBe(true);
    });

    it('should return false for status codes below 400', () => {
      const successResponse = {
        response: { status: 200 }
      };

      expect(isClientError(successResponse)).toBe(false);
    });

    it('should return false for status codes 500+', () => {
      const serverError = {
        response: { status: 500 }
      };

      expect(isClientError(serverError)).toBe(false);
    });

    it('should return false for errors without response', () => {
      const networkError = {
        code: 'NETWORK_ERROR'
      };

      expect(isClientError(networkError)).toBe(false);
    });

    it('should return false for null/undefined errors', () => {
      expect(isClientError(null)).toBe(false);
      expect(isClientError(undefined)).toBe(false);
    });
  });
});
