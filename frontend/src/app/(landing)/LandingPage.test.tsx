/**
 * @file LandingPage component tests
 * @description Smoke test — renders without throwing
 * @module app/(landing)/LandingPage.test
 */

import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LandingPage } from './LandingPage';

vi.mock('@/utils/constants', () => ({
  API_URL: 'http://localhost:3000/api',
  USE_MOCK_API: true,
}));

vi.mock('@/hooks/useProfile', () => ({
  useProfile: () => ({ data: null, isLoading: false, error: null }),
}));

describe('LandingPage', () => {
  it('renders without throwing', () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    expect(() =>
      render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <LandingPage />
          </BrowserRouter>
        </QueryClientProvider>,
      ),
    ).not.toThrow();
  });
});
