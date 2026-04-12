/**
 * @file API client
 * @description Axios instance with interceptors for auth and error handling
 * @module services/api
 */

import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_URL } from '@/utils/constants';
import type { ApiErrorResponse } from '@/types/api.types';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

// Lazy reference to auth store — set by auth.store.ts to avoid circular deps
let getAuthToken: (() => string | null) | null = null;
let onUnauthorized: (() => void) | null = null;

export function setAuthCallbacks(
  tokenGetter: () => string | null,
  unauthorizedHandler: () => void,
): void {
  getAuthToken = tokenGetter;
  onUnauthorized = unauthorizedHandler;
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (getAuthToken) {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === 401) {
      onUnauthorized?.();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export type { ApiErrorResponse };
