import axios from "axios";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import {
  apiPost,
  getApiClient,
  getErrorMessage,
  isApiError,
} from "@/services/api-client";
import type { ApiSuccessResponse } from "@/types/api";
import type { AuthTokens, LoginResponse, User } from "@/types/user";
import type {
  ForgotPasswordPayload,
  LoginCredentials,
  RegisterPayload,
  ResetPasswordPayload,
} from "@/features/auth/types/auth.types";

interface RawLoginResponse {
  access?: string;
  refresh?: string;
  access_token?: string;
  refresh_token?: string;
  user?: User;
}

function normalizeTokens(data: RawLoginResponse): AuthTokens {
  return {
    access_token: data.access_token ?? data.access ?? "",
    refresh_token: data.refresh_token ?? data.refresh ?? "",
  };
}

async function fetchProfile(accessToken: string): Promise<User> {
  const client = getApiClient();
  const response = await client.get<ApiSuccessResponse<User>>(
    API_ENDPOINTS.AUTH.PROFILE,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      skipAuth: true,
    } as never,
  );

  if (!response.data.success) {
    throw new Error(response.data.message);
  }

  return response.data.data;
}

export async function loginUser(
  credentials: LoginCredentials,
): Promise<LoginResponse> {
  try {
    const client = getApiClient();
    const response = await client.post<
      ApiSuccessResponse<LoginResponse> | RawLoginResponse
    >(API_ENDPOINTS.AUTH.LOGIN, credentials, { skipAuth: true } as never);

    const data = response.data;

    if ("success" in data) {
      if (!data.success) {
        throw new Error(
          (data as { message?: string }).message ?? "Login failed",
        );
      }
      const payload = data.data as LoginResponse & RawLoginResponse;
      const tokens = normalizeTokens(payload);
      const user =
        payload.user ?? (await fetchProfile(tokens.access_token));
      return { ...tokens, user };
    }

    const tokens = normalizeTokens(data as RawLoginResponse);
    if (!tokens.access_token) {
      throw new Error("Invalid login response from server");
    }

    const user =
      (data as RawLoginResponse).user ??
      (await fetchProfile(tokens.access_token));

    return { ...tokens, user };
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function registerUser(payload: RegisterPayload): Promise<void> {
  const response = await apiPost<{ id: number }>(
    API_ENDPOINTS.AUTH.REGISTER,
    payload,
    { skipAuth: true },
  );

  if (isApiError(response)) {
    throw new Error(response.message);
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await apiPost(API_ENDPOINTS.AUTH.LOGOUT);
  } catch {
    // Session is cleared client-side regardless of API availability.
  }
}

export async function requestPasswordReset(
  payload: ForgotPasswordPayload,
): Promise<void> {
  const response = await apiPost<null>(
    API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
    payload,
    { skipAuth: true },
  );

  if (isApiError(response)) {
    throw new Error(response.message);
  }
}

export async function resetPassword(
  payload: ResetPasswordPayload,
): Promise<void> {
  const response = await apiPost<null>(
    API_ENDPOINTS.AUTH.RESET_PASSWORD,
    payload,
    { skipAuth: true },
  );

  if (isApiError(response)) {
    throw new Error(response.message);
  }
}

export function getFieldErrors(error: unknown): Record<string, string[]> {
  if (axios.isAxiosError(error) && error.response?.data?.errors) {
    return error.response.data.errors as Record<string, string[]>;
  }
  return {};
}
