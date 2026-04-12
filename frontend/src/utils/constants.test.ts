/**
 * @file App constants tests
 * @description Tests for centralized configuration constants
 * @module utils/constants.test
 */

import { describe, it, expect } from 'vitest';
import { API_URL, USE_MOCK_API } from './constants';

describe('constants', () => {
  it('exports API_URL as a string', () => {
    expect(typeof API_URL).toBe('string');
  });

  it('API_URL falls back to localhost when VITE_API_URL is not set', () => {
    expect(API_URL).toBe('http://localhost:3000/api');
  });

  it('exports USE_MOCK_API as a boolean', () => {
    expect(typeof USE_MOCK_API).toBe('boolean');
  });

  it('USE_MOCK_API defaults to true when VITE_USE_MOCK_API is not set', () => {
    expect(USE_MOCK_API).toBe(true);
  });
});
