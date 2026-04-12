/**
 * @file User types
 * @description Type definitions for user and auth responses
 * @module types/user
 */

import type { User } from '@/models/models';

export type { User };

export interface AuthResponse {
  user: User;
  token: string;
}
