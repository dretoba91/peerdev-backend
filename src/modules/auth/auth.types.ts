import type { SafeUser } from '../user/user.types';

// Returned after successful login or OTP verification
export interface AuthUserResponse {
  user:         SafeUser;
  access_token: string;
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
}

// Returned after registration or OTP resend
export interface MessageResponse {
  message: string;
}

// JWT payload shape
export interface JwtPayload {
  userId:  string;
  email:   string;
  role_id: string;
}