/**
 * @file Auth service tests
 * @description Tests for mock auth service functions
 * @module services/auth.service.test
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { authService } from '@/services/auth.service';

describe('authService (mock)', () => {
  beforeEach(() => {
    // Reset mock state between tests by registering then clearing
  });

  describe('register', () => {
    it('registers a new user and returns user + token', async () => {
      const result = await authService.register('Test User', 'test@example.com', 'password123');

      expect(result.user).toEqual({
        id: expect.stringMatching(/^user-\d+$/),
        email: 'test@example.com',
        name: 'Test User',
      });
      expect(result.token).toMatch(/^mock-jwt-/);
    });

    it('rejects duplicate email registration', async () => {
      await authService.register('User One', 'dup@example.com', 'pass123');

      await expect(
        authService.register('User Two', 'dup@example.com', 'pass456'),
      ).rejects.toThrow('An account with this email already exists');
    });
  });

  describe('login', () => {
    it('logs in with registered credentials', async () => {
      await authService.register('Login Test', 'login@example.com', 'mypass123');

      const result = await authService.login('login@example.com', 'mypass123');

      expect(result.user.email).toBe('login@example.com');
      expect(result.user.name).toBe('Login Test');
      expect(result.token).toMatch(/^mock-jwt-/);
    });

    it('rejects wrong password', async () => {
      await authService.register('Wrong Pass', 'wrongpass@example.com', 'correct123');

      await expect(
        authService.login('wrongpass@example.com', 'wrong123'),
      ).rejects.toThrow('Invalid email or password');
    });

    it('rejects unregistered email', async () => {
      await expect(
        authService.login('nonexistent@example.com', 'password123'),
      ).rejects.toThrow('Invalid email or password');
    });
  });

  describe('logout', () => {
    it('resolves without error', async () => {
      await expect(authService.logout()).resolves.toBeUndefined();
    });
  });
});
