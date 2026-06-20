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

function createAxiosInstance(config: ApiClientConfig): AxiosInstance {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30_000,
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
      if (token) {
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
        !originalRequest.url?.includes(API_ENDPOINTS.AUTH.LOGIN)
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
    throw new Error(
      "API client not initialized. Call initializeApiClient() in AuthProvider.",
    );
  }
  return clientInstance;
}

export async function apiGet<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  const response = await getApiClient().get<ApiResponse<T>>(url, config);
  return response.data;
}

export type ApiRequestConfig = AxiosRequestConfig & { skipAuth?: boolean };

export async function apiPost<T>(
  url: string,
  body?: unknown,
  config?: ApiRequestConfig,
): Promise<ApiResponse<T>> {
  const response = await getApiClient().post<ApiResponse<T>>(url, body, config);
  return response.data;
}

export async function apiPut<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  const response = await getApiClient().put<ApiResponse<T>>(url, body, config);
  return response.data;
}

export async function apiPatch<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  const response = await getApiClient().patch<ApiResponse<T>>(url, body, config);
  return response.data;
}

export async function apiDelete<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  const response = await getApiClient().delete<ApiResponse<T>>(url, config);
  return response.data;
}

export function isApiError<T>(
  response: ApiResponse<T>,
): response is ApiErrorResponse {
  return !response.success;
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
