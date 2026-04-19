/**
 * @file Route guard tests
 * @description Tests for requireAuth and requireNoAuth loader functions
 * @module app/routes.test
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { requireAuth, requireNoAuth } from './routes';
import { useAuthStore } from '@/stores/auth.store';

function getRedirectUrl(error: unknown): string | null {
  if (error instanceof Response && error.status >= 300 && error.status < 400) {
    return error.headers.get('Location');
  }
  return null;
}

describe('requireAuth', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null });
  });

  it('throws redirect to /login when no token', () => {
    try {
      requireAuth();
      expect.unreachable('should have thrown');
    } catch (error) {
      expect(getRedirectUrl(error)).toBe('/login');
    }
  });

  it('returns null when token is present', () => {
    useAuthStore.setState({ token: 'valid-token', user: null });
    expect(requireAuth()).toBeNull();
  });
});

describe('requireNoAuth', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null });
  });

  it('returns null when no token', () => {
    expect(requireNoAuth()).toBeNull();
  });

  it('throws redirect to /records when token is present', () => {
    useAuthStore.setState({ token: 'valid-token', user: null });
    try {
      requireNoAuth();
      expect.unreachable('should have thrown');
    } catch (error) {
      expect(getRedirectUrl(error)).toBe('/records');
    }
  });
});
