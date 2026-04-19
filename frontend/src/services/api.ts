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
  (response) => {
    // Handle standardized response format: { success: boolean, data: T, error?: string }
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      if (response.data.success) {
        return { ...response, data: response.data.data };
      } else {
        const errorMsg = response.data.error || 'Unknown error occurred';
        return Promise.reject(new Error(errorMsg));
      }
    }
    return response;
  },
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === 401) {
      onUnauthorized?.();
      window.location.href = '/login';
    }
    const apiMessage = error.response?.data?.error ?? error.response?.data?.message;
    if (apiMessage) {
      return Promise.reject(new Error(apiMessage));
    }
    return Promise.reject(error);
  },
);

export type { ApiErrorResponse };
