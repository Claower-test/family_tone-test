/**
 * @file AppLayout component tests
 * @description Tests for app navigation shell
 * @module app/(app)/AppLayout.test
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppLayout } from './AppLayout';
import * as useProfileModule from '@/hooks/useProfile';

vi.mock('@/hooks/useProfile');

vi.mock('@/services/audio.service', () => ({
  audioService: {
    start: vi.fn().mockResolvedValue(undefined),
    stop: vi.fn().mockResolvedValue(new Blob()),
    abort: vi.fn(),
  },
}));

function renderLayout() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </QueryClientProvider>,
  );
}

function mockProfile(avatar_url = '') {
  vi.mocked(useProfileModule.useProfile).mockReturnValue({
    data: { id: 1, email: 'a@b.com', name: 'Test', avatar_url },
    isLoading: false,
    error: null,
  } as ReturnType<typeof useProfileModule.useProfile>);
}

describe('AppLayout', () => {
  it('renders without throwing', () => {
    mockProfile();
    expect(() => renderLayout()).not.toThrow();
  });

  it('renders brand logo text', () => {
    mockProfile();
    renderLayout();
    expect(screen.getByText('FamilyTone')).toBeInTheDocument();
  });

  it('brand logo links to /records', () => {
    mockProfile();
    renderLayout();
    const logo = screen.getByText('FamilyTone').closest('a');
    expect(logo).toHaveAttribute('href', '/records');
  });

  it('avatar links to /profile', () => {
    mockProfile();
    renderLayout();
    const links = screen.getAllByRole('link');
    const profileLink = links.find((l) => l.getAttribute('href') === '/profile');
    expect(profileLink).toBeDefined();
  });

  it('shows fallback icon when no avatar_url', () => {
    mockProfile('');
    renderLayout();
    const profileLink = screen.getAllByRole('link').find((l) => l.getAttribute('href') === '/profile')!;
    expect(profileLink.querySelector('img')).toBeNull();
  });

  it('shows avatar image when avatar_url is set', () => {
    mockProfile('/api/uploads/avatars/test.svg');
    renderLayout();
    const img = screen.getByAltText('avatar');
    expect(img).toBeInTheDocument();
    expect(img.getAttribute('src')).toContain('/api/uploads/avatars/test.svg');
  });
});
