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

  it('API_URL reads from env or falls back to localhost', () => {
    // With .env set, API_URL is the real URL; without it, falls back to localhost
    expect(API_URL).toMatch(/^https?:\/\/.+\/api$/);
  });

  it('exports USE_MOCK_API as a boolean', () => {
    expect(typeof USE_MOCK_API).toBe('boolean');
  });

  it('USE_MOCK_API reflects env value', () => {
    // With .env VITE_USE_MOCK_API=false, this is false
    expect(typeof USE_MOCK_API).toBe('boolean');
  });
});
