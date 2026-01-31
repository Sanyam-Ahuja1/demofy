/**
 * Standardized API response formatter
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  error: {
    code: string;
    message: string;
    details?: any;
  } | null;
}

export const successResponse = <T>(
  data: T,
  _message?: string,
  pagination?: any
): ApiResponse<T> => ({
  success: true,
  data,
  pagination,
  error: null,
});

export const errorResponse = (
  code: string,
  message: string,
  details?: any
): ApiResponse => ({
  success: false,
  data: null,
  error: {
    code,
    message,
    details,
  },
});
