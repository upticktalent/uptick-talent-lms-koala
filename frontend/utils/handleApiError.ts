import { AxiosError } from 'axios';

export function handleApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    // Handle Axios errors
    if (error.response?.data?.error) {
      return error.response.data.error;
    }

    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    // Handle HTTP status codes
    switch (error.response?.status) {
      case 400:
        return 'Bad request. Please check your input.';
      case 401:
        return 'Unauthorized. Please log in again.';
      case 403:
        return 'Forbidden. You do not have permission to perform this action.';
      case 404:
        return 'Resource not found.';
      case 409:
        return 'Conflict. The resource already exists.';
      case 422:
        return 'Validation error. Please check your input.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Internal server error. Please try again later.';
      case 503:
        return 'Service unavailable. Please try again later.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred.';
}

export function getErrorMessage(error: unknown): string {
  return handleApiError(error);
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return !error.response && !!error.request;
  }
  return false;
}

export function isServerError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return !!error.response && error.response.status >= 500;
  }
  return false;
}

export function isClientError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return (
      !!error.response &&
      error.response.status >= 400 &&
      error.response.status < 500
    );
  }
  return false;
}
