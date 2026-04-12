/**
 * @file API client tests
 * @description Tests for axios instance interceptors and setAuthCallbacks pattern
 * @module services/api.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { InternalAxiosRequestConfig, AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types/api.types';
import { api, setAuthCallbacks } from './api';

function getRequestInterceptor() {
  const handler = api.interceptors.request.handlers?.[0];
  return handler!.fulfilled!;
}

function getResponseRejectionInterceptor(): (error: AxiosError<ApiErrorResponse>) => Promise<never> {
  const handler = api.interceptors.response.handlers?.[0];
  return handler!.rejected!;
}

describe('api', () => {
  const mockTokenGetter = vi.fn<() => string | null>();
  const mockUnauthorizedHandler = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockTokenGetter.mockReturnValue(null);
    mockUnauthorizedHandler.mockReset();
    setAuthCallbacks(mockTokenGetter, mockUnauthorizedHandler);
  });

  it('adds Authorization header when token getter returns a value', () => {
    mockTokenGetter.mockReturnValue('test-token');
    const interceptor = getRequestInterceptor();

    const result = interceptor({
      headers: {} as Record<string, string>,
    } as InternalAxiosRequestConfig);

    const config = result as InternalAxiosRequestConfig;
    expect(config.headers.Authorization).toBe('Bearer test-token');
  });

  it('omits Authorization header when token getter returns null', () => {
    mockTokenGetter.mockReturnValue(null);
    const interceptor = getRequestInterceptor();

    const result = interceptor({
      headers: {} as Record<string, string>,
    } as InternalAxiosRequestConfig);

    const config = result as InternalAxiosRequestConfig;
    expect(config.headers.Authorization).toBeUndefined();
  });

  it('calls unauthorized handler on 401 response', async () => {
    const error = {
      response: { status: 401, data: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
    } as unknown as AxiosError<ApiErrorResponse>;

    const rejectionHandler = getResponseRejectionInterceptor();
    await expect(rejectionHandler(error)).rejects.toBe(error);
    expect(mockUnauthorizedHandler).toHaveBeenCalledOnce();
  });

  it('does not call unauthorized handler on non-401 errors', async () => {
    const error = {
      response: { status: 500, data: { message: 'Server Error', code: 'INTERNAL' } },
    } as unknown as AxiosError<ApiErrorResponse>;

    const rejectionHandler = getResponseRejectionInterceptor();
    await expect(rejectionHandler(error)).rejects.toBe(error);
    expect(mockUnauthorizedHandler).not.toHaveBeenCalled();
  });
});
