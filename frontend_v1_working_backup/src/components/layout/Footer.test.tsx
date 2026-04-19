/**
 * @file Footer component tests
 * @description Smoke test — renders without throwing
 * @module components/layout/Footer.test
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Footer } from './Footer';

describe('Footer', () => {
  it('renders without throwing', () => {
    expect(() => render(<Footer />)).not.toThrow();
  });
});
