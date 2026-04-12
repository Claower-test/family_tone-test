/**
 * @file AppLayout component tests
 * @description Smoke test — renders with outlet without throwing
 * @module app/(app)/AppLayout.test
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { AppLayout } from './AppLayout';

describe('AppLayout', () => {
  it('renders without throwing', () => {
    expect(() =>
      render(
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>,
      ),
    ).not.toThrow();
  });
});
