import type { Role } from "@/types/roles";

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  profile_image?: string;
  role: Role;
  status: "active" | "inactive" | "locked";
  created_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface AuthSession {
  user: User;
  tokens: AuthTokens;
}
