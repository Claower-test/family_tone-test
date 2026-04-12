/**
 * @file App constants
 * @description Centralized configuration constants
 * @module utils/constants
 */

export const API_URL: string =
  import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';

export const USE_MOCK_API: boolean =
  import.meta.env.VITE_USE_MOCK_API === 'true';
