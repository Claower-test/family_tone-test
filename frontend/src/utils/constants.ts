/**
 * @file App constants
 * @description Centralized configuration constants
 * @module utils/constants
 */

export const API_URL: string =
  import.meta.env.PROD || !import.meta.env.VITE_API_URL
    ? '/api'
    : import.meta.env.VITE_API_URL;

export const USE_MOCK_API: boolean =
  import.meta.env.VITE_USE_MOCK_API === 'true';
