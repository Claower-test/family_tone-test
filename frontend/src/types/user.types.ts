/**
 * @file User types
 * @description Type definitions for user and auth responses
 * @module types/user
 */

export interface User {
  id: number;
  email: string;
  name: string;
  avatar_url?: string;
  bio?: string;
  created_at?: string;
  followers_count?: number;
  following_count?: number;
  records_count?: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}
