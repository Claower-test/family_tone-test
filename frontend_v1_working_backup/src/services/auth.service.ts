/**
 * @file Auth service
 * @description Authentication API calls with mock implementation
 * @module services/auth
 */

import { api } from '@/services/api';
import { USE_MOCK_API } from '@/utils/constants';
import type { AuthResponse } from '@/types/user.types';

interface MockUser {
  id: number;
  name: string;
  password: string;
}

const mockUsers = new Map<string, MockUser>();
let mockIdCounter = 0;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateMockToken(userId: number): string {
  return `mock-jwt-${userId}-${Date.now()}`;
}

async function mockLogin(email: string, password: string): Promise<AuthResponse> {
  await delay(500);
  const mockUser = mockUsers.get(email);
  if (!mockUser || mockUser.password !== password) {
    throw new Error('Invalid email or password');
  }
  return {
    user: { id: mockUser.id, email, name: mockUser.name },
    token: generateMockToken(mockUser.id),
  };
}

async function mockRegister(
  name: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  await delay(500);
  if (mockUsers.has(email)) {
    throw new Error('An account with this email already exists');
  }
  mockIdCounter += 1;
  const id = mockIdCounter;
  mockUsers.set(email, { id, name, password });
  return {
    user: { id, email, name },
    token: generateMockToken(id),
  };
}

async function mockLogout(): Promise<void> {
  // No delay for logout
}

async function realLogin(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
  return data;
}

async function realRegister(
  name: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', { name, email, password });
  return data;
}

async function realLogout(): Promise<void> {
  await api.post('/auth/logout');
}

export const authService = {
  login: USE_MOCK_API ? mockLogin : realLogin,
  register: USE_MOCK_API ? mockRegister : realRegister,
  logout: USE_MOCK_API ? mockLogout : realLogout,
};
