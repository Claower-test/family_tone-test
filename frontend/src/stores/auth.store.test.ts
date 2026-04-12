/**
 * @file Auth store tests
 * @description Tests for Zustand auth store actions
 * @module stores/auth.store.test
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '@/stores/auth.store';

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null });
  });

  it('starts with null user and token', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it('login sets user and token on success', async () => {
    // Register first to create the mock user
    await useAuthStore.getState().register('Store Test', 'store@example.com', 'pass123');

    // Reset and test login
    useAuthStore.setState({ user: null, token: null });
    await useAuthStore.getState().login('store@example.com', 'pass123');

    const state = useAuthStore.getState();
    expect(state.user).not.toBeNull();
    expect(state.user?.email).toBe('store@example.com');
    expect(state.user?.name).toBe('Store Test');
    expect(state.token).toMatch(/^mock-jwt-/);
  });

  it('login throws and does not set state on wrong credentials', async () => {
    await expect(
      useAuthStore.getState().login('nobody@example.com', 'wrong'),
    ).rejects.toThrow('Invalid email or password');

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it('register sets user and token on success', async () => {
    await useAuthStore.getState().register('New User', 'new@example.com', 'pass123');

    const state = useAuthStore.getState();
    expect(state.user).not.toBeNull();
    expect(state.user?.email).toBe('new@example.com');
    expect(state.token).toMatch(/^mock-jwt-/);
  });

  it('register throws on duplicate email', async () => {
    await useAuthStore.getState().register('First', 'dup@example.com', 'pass123');

    await expect(
      useAuthStore.getState().register('Second', 'dup@example.com', 'pass456'),
    ).rejects.toThrow('An account with this email already exists');
  });

  it('logout clears user and token', async () => {
    await useAuthStore.getState().register('Logout Test', 'logout@example.com', 'pass123');
    expect(useAuthStore.getState().token).not.toBeNull();

    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });
});
