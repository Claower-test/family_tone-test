/**
 * @file App root component tests
 * @description Smoke test — renders with providers without throwing
 * @module app/App.test
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { App } from './App';

describe('App', () => {
  it('renders without throwing', () => {
    expect(() => render(<App />)).not.toThrow();
  });
});
