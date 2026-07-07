import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "@/constants/api-endpoints";
import type { ApiErrorResponse, ApiResponse } from "@/types/api";
import type { AuthTokens } from "@/types/user";

type TokenGetter = () => string | null;
type TokenRefresher = () => Promise<AuthTokens | null>;
type SessionClearer = () => void;

interface ApiClientConfig {
  getAccessToken: TokenGetter;
  refreshTokens: TokenRefresher;
  clearSession: SessionClearer;
}

let clientInstance: AxiosInstance | null = null;
let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

function processRefreshQueue(token: string | null): void {
  refreshQueue.forEach((callback) => callback(token));
  refreshQueue = [];
}

export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    const payload = parts[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(base64));
    if (!decoded.exp) return false;
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
}

function createAxiosInstance(config: ApiClientConfig): AxiosInstance {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 60_000,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  instance.interceptors.request.use((request: InternalAxiosRequestConfig) => {
    const skipAuth = (request as InternalAxiosRequestConfig & { skipAuth?: boolean })
      .skipAuth;

    if (!skipAuth) {
      const token = config.getAccessToken();
      if (token && !isTokenExpired(token)) {
        request.headers.Authorization = `Bearer ${token}`;
      }
    }

    return request;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiErrorResponse>) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      if (
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retry &&
        !originalRequest.url?.includes(API_ENDPOINTS.AUTH.LOGIN) &&
        !originalRequest.url?.includes(API_ENDPOINTS.AUTH.REFRESH)
      ) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            refreshQueue.push((token) => {
              if (!token) {
                reject(error);
                return;
              }
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(instance(originalRequest));
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const tokens = await config.refreshTokens();
          processRefreshQueue(tokens?.access_token ?? null);

          if (!tokens?.access_token) {
            config.clearSession();
            return Promise.reject(error);
          }

          originalRequest.headers.Authorization = `Bearer ${tokens.access_token}`;
          return instance(originalRequest);
        } catch (refreshError) {
          processRefreshQueue(null);
          config.clearSession();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    },
  );

  return instance;
}

export function initializeApiClient(config: ApiClientConfig): AxiosInstance {
  clientInstance = createAxiosInstance(config);
  return clientInstance;
}

export function getApiClient(): AxiosInstance {
  if (!clientInstance) {
    clientInstance = createAxiosInstance({
      getAccessToken: () => {
        if (typeof window === "undefined") return null;
        try {
          const stored =
            localStorage.getItem("church-auth-storage") ||
            localStorage.getItem("auth-storage");
          if (stored) {
            const parsed = JSON.parse(stored);
            return parsed.state?.tokens?.access_token || null;
          }
        } catch (e) {
          return null;
        }
        return null;
      },
      refreshTokens: async () => null,
      clearSession: () => {},
    });
  }
  return clientInstance;
}

function formatApiError(error: unknown): ApiErrorResponse {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) {
      return {
        success: false,
        message: "Your session has expired. Please sign in again.",
        errors: error.response.data || {},
      };
    }
    if (error.response?.data) {
      const data = error.response.data as any;
      if (typeof data === "object" && data !== null) {
        let msg = data.message || data.detail;
        if ((!msg || msg === "Validation failed.") && data.errors && typeof data.errors === "object") {
          const errObj = data.errors;
          const keys = Object.keys(errObj);
          if (keys.length > 0) {
            const firstKey = keys[0];
            const firstErr = Array.isArray(errObj[firstKey]) ? errObj[firstKey][0] : errObj[firstKey];
            msg = firstKey === "error" || firstKey === "detail" ? String(firstErr) : `${firstKey}: ${typeof firstErr === 'object' ? JSON.stringify(firstErr) : firstErr}`;
          }
        }
        if (!msg || msg === "Validation failed.") {
          const keys = Object.keys(data);
          if (keys.length > 0) {
            const firstKey = keys[0];
            const firstErr = Array.isArray(data[firstKey]) ? data[firstKey][0] : data[firstKey];
            msg = `${firstKey}: ${typeof firstErr === 'object' ? JSON.stringify(firstErr) : firstErr}`;
          } else {
            msg = "An unexpected error occurred.";
          }
        }
        return {
          success: false,
          message: msg,
          errors: data.errors || data,
        };
      } else if (typeof data === "string") {
        return {
          success: false,
          message: data,
        };
      }
    }
  }
  return {
    success: false,
    message: getErrorMessage(error),
  };
}

export async function apiGet<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  try {
    const response = await getApiClient().get<ApiResponse<T>>(url, config);
    return response.data;
  } catch (error) {
    return formatApiError(error);
  }
}

export type ApiRequestConfig = AxiosRequestConfig & { skipAuth?: boolean };

export async function apiPost<T>(
  url: string,
  body?: unknown,
  config?: ApiRequestConfig,
): Promise<ApiResponse<T>> {
  try {
    const response = await getApiClient().post<ApiResponse<T>>(url, body, config);
    return response.data;
  } catch (error) {
    return formatApiError(error);
  }
}

export async function apiPut<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  try {
    const response = await getApiClient().put<ApiResponse<T>>(url, body, config);
    return response.data;
  } catch (error) {
    return formatApiError(error);
  }
}

export async function apiPatch<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  try {
    const response = await getApiClient().patch<ApiResponse<T>>(url, body, config);
    return response.data;
  } catch (error) {
    return formatApiError(error);
  }
}

export async function apiDelete<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  try {
    const response = await getApiClient().delete<ApiResponse<T>>(url, config);
    return response.data;
  } catch (error) {
    return formatApiError(error);
  }
}

export function isApiError<T>(
  response: ApiResponse<T>,
): response is ApiErrorResponse {
  return !response || response.success === false;
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.message ?? error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
}
