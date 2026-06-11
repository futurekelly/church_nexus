export interface PaginationMeta {
  page: number;
  page_size: number;
  total_pages: number;
  total_records: number;
}

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  pagination?: PaginationMeta;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface ApiRequestConfig {
  params?: Record<string, string | number | boolean | undefined>;
  skipAuth?: boolean;
}
