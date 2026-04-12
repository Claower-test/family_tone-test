/**
 * @file LandingPage component tests
 * @description Smoke test — renders without throwing
 * @module app/(landing)/LandingPage.test
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { LandingPage } from './LandingPage';

describe('LandingPage', () => {
  it('renders without throwing', () => {
    expect(() =>
      render(
        <BrowserRouter>
          <LandingPage />
        </BrowserRouter>,
      ),
    ).not.toThrow();
  });
});
