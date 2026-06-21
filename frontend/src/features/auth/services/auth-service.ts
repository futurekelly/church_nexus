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

const MOCK_USERS: Record<string, User> = {
  "superadmin@church.com": {
    id: 1,
    first_name: "Super",
    last_name: "Admin",
    email: "superadmin@church.com",
    role: "super_admin",
    status: "active",
    created_at: new Date().toISOString(),
  },
  "admin@church.com": {
    id: 2,
    first_name: "David",
    last_name: "Kamau",
    email: "admin@church.com",
    role: "church_admin",
    status: "active",
    created_at: new Date().toISOString(),
    member_id: "m001",
    memberId: "m001",
  },
  "pastor@church.com": {
    id: 3,
    first_name: "John",
    last_name: "Pastor",
    email: "pastor@church.com",
    role: "pastor",
    status: "active",
    created_at: new Date().toISOString(),
  },
  "treasurer@church.com": {
    id: 4,
    first_name: "Samuel",
    last_name: "Ochieng",
    email: "treasurer@church.com",
    role: "treasurer",
    status: "active",
    created_at: new Date().toISOString(),
  },
  "media@church.com": {
    id: 5,
    first_name: "Peter",
    last_name: "Mwangi",
    email: "media@church.com",
    role: "media_team",
    status: "active",
    created_at: new Date().toISOString(),
  },
  "member@church.com": {
    id: 6,
    first_name: "Grace",
    last_name: "Wanjiku",
    email: "member@church.com",
    role: "member",
    status: "active",
    created_at: new Date().toISOString(),
    member_id: "m002",
    memberId: "m002",
  },
};

export async function loginUser(
  credentials: LoginCredentials,
): Promise<LoginResponse> {
  const emailLower = credentials.email.toLowerCase();
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
    if (process.env.NODE_ENV !== "production") {
      // Check if network/connection error to fallback to local mock login
      const isConnectionError =
        axios.isAxiosError(error) &&
        (!error.response || error.code === "ERR_NETWORK" || error.message.includes("Network Error"));

      if (isConnectionError && MOCK_USERS[emailLower]) {
        console.warn("Backend API not reachable. Logging in with mock user:", emailLower);
        return {
          access_token: "mock-access-token",
          refresh_token: "mock-refresh-token",
          user: MOCK_USERS[emailLower],
        };
      }
      
      // Also fallback if backend throws a 404/500/etc during development
      if (MOCK_USERS[emailLower]) {
        console.warn("Backend failed. Falling back to mock user:", emailLower);
        return {
          access_token: "mock-access-token",
          refresh_token: "mock-refresh-token",
          user: MOCK_USERS[emailLower],
        };
      }
    }

    throw new Error(getErrorMessage(error));
  }
}

export async function registerUser(payload: RegisterPayload): Promise<void> {
  try {
    const response = await apiPost<{ id: number }>(
      API_ENDPOINTS.AUTH.REGISTER,
      payload,
      { skipAuth: true },
    );

    if (isApiError(response)) {
      throw new Error(response.message);
    }
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      const isConnectionError =
        axios.isAxiosError(error) &&
        (!error.response || error.code === "ERR_NETWORK" || error.message.includes("Network Error"));
      if (isConnectionError) {
        console.warn("Backend down. Simulating successful mock registration.");
        return;
      }
    }
    throw new Error(getErrorMessage(error));
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
  try {
    const response = await apiPost<null>(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
      payload,
      { skipAuth: true },
    );

    if (isApiError(response)) {
      throw new Error(response.message);
    }
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      const isConnectionError =
        axios.isAxiosError(error) &&
        (!error.response || error.code === "ERR_NETWORK" || error.message.includes("Network Error"));
      if (isConnectionError) {
        console.warn("Backend down. Simulating successful password reset request.");
        return;
      }
    }
    throw new Error(getErrorMessage(error));
  }
}

export async function resetPassword(
  payload: ResetPasswordPayload,
): Promise<void> {
  try {
    const response = await apiPost<null>(
      API_ENDPOINTS.AUTH.RESET_PASSWORD,
      {
        uid: payload.uid,
        token: payload.token,
        new_password: payload.password,
      },
      { skipAuth: true },
    );

    if (isApiError(response)) {
      throw new Error(response.message);
    }
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      const isConnectionError =
        axios.isAxiosError(error) &&
        (!error.response || error.code === "ERR_NETWORK" || error.message.includes("Network Error"));
      if (isConnectionError) {
        console.warn("Backend down. Simulating successful password reset completion.");
        return;
      }
    }
    throw new Error(getErrorMessage(error));
  }
}

export function getFieldErrors(error: unknown): Record<string, string[]> {
  if (axios.isAxiosError(error) && error.response?.data?.errors) {
    return error.response.data.errors as Record<string, string[]>;
  }
  return {};
}
