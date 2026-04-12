/**
 * @file Navbar component tests
 * @description Smoke test — renders without throwing
 * @module components/layout/Navbar.test
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Navbar } from './Navbar';

describe('Navbar', () => {
  it('renders without throwing', () => {
    expect(() => render(<Navbar />)).not.toThrow();
  });
});
