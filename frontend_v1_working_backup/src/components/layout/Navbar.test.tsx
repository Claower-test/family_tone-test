/**
 * @file Navbar component tests
 * @description Tests for auth-aware CTA, avatar, dropdown, and mobile menu
 * @module components/layout/Navbar.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navbar } from './Navbar';
import { useAuthStore } from '@/stores/auth.store';
import * as useProfileModule from '@/hooks/useProfile';

vi.mock('@/utils/constants', () => ({
  API_URL: 'http://localhost:3000/api',
  USE_MOCK_API: true,
}));

vi.mock('@/hooks/useProfile');

function mockProfile(avatar_url = '') {
  vi.mocked(useProfileModule.useProfile).mockReturnValue({
    data: { id: 1, email: 'a@b.com', name: 'Test', avatar_url },
    isLoading: false,
    error: null,
  } as ReturnType<typeof useProfileModule.useProfile>);
}

function renderNavbar() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    </QueryClientProvider>,
  );
}

describe('Navbar', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null });
    mockProfile();
  });

  it('renders without throwing', () => {
    expect(() => renderNavbar()).not.toThrow();
  });

  it('shows "Начать" and navigates to /register when no token', async () => {
    const user = userEvent.setup();
    renderNavbar();

    const ctaButton = screen.getByRole('button', { name: 'Начать' });
    expect(ctaButton).toBeInTheDocument();

    await user.click(ctaButton);
    expect(window.location.pathname).toBe('/register');
  });

  it('shows "Записать" and navigates to /records when token exists', async () => {
    useAuthStore.setState({ token: 'test-token' });
    const user = userEvent.setup();
    renderNavbar();

    const ctaButton = screen.getByRole('button', { name: 'Записать' });
    expect(ctaButton).toBeInTheDocument();

    await user.click(ctaButton);
    expect(window.location.pathname).toBe('/records');
  });

  it('renders avatar image when profile has avatar_url', () => {
    useAuthStore.setState({ token: 'test-token' });
    mockProfile('/uploads/avatar.jpg');
    renderNavbar();

    const avatar = screen.getByAltText('avatar');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', 'http://localhost:3000/uploads/avatar.jpg');
  });

  it('does not render avatar when unauthenticated', () => {
    renderNavbar();

    expect(screen.queryByAltText('avatar')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Начать' })).toBeInTheDocument();
  });

  it('opens dropdown with menu items on avatar click', async () => {
    useAuthStore.setState({ token: 'test-token' });
    mockProfile('/uploads/avatar.jpg');
    const user = userEvent.setup();
    renderNavbar();

    await user.click(screen.getByAltText('avatar'));

    expect(screen.getByText('Записи')).toBeInTheDocument();
    expect(screen.getByText('Профиль')).toBeInTheDocument();
    expect(screen.getByText('Выйти из аккаунта')).toBeInTheDocument();
  });

  it('navigates to /records when "Записи" clicked in dropdown', async () => {
    useAuthStore.setState({ token: 'test-token' });
    mockProfile('/uploads/avatar.jpg');
    const user = userEvent.setup();
    renderNavbar();

    await user.click(screen.getByAltText('avatar'));
    await user.click(screen.getByText('Записи'));

    expect(window.location.pathname).toBe('/records');
  });

  it('navigates to /profile when "Профиль" clicked in dropdown', async () => {
    useAuthStore.setState({ token: 'test-token' });
    mockProfile('/uploads/avatar.jpg');
    const user = userEvent.setup();
    renderNavbar();

    await user.click(screen.getByAltText('avatar'));
    await user.click(screen.getByText('Профиль'));

    expect(window.location.pathname).toBe('/profile');
  });

  it('logs out and navigates to /login when "Выйти" clicked', async () => {
    useAuthStore.setState({ token: 'test-token' });
    mockProfile('/uploads/avatar.jpg');
    const user = userEvent.setup();
    renderNavbar();

    await user.click(screen.getByAltText('avatar'));
    await user.click(screen.getByText('Выйти из аккаунта'));

    expect(useAuthStore.getState().token).toBeNull();
    expect(window.location.pathname).toBe('/login');
  });
});

describe('Navbar mobile menu', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null });
    mockProfile();
  });

  it('CTA/avatar wrapper has hidden md:flex class', () => {
    useAuthStore.setState({ token: 'test-token' });
    mockProfile('/uploads/avatar.jpg');
    renderNavbar();

    const avatar = screen.getByAltText('avatar');
    const wrapper = avatar.closest('.hidden.md\\:flex');
    expect(wrapper).not.toBeNull();
  });

  it('mobile menu shows "Начать" CTA when unauthenticated', async () => {
    const user = userEvent.setup();
    renderNavbar();

    const hamburger = screen.getByRole('button', { name: '' });
    await user.click(hamburger);

    const menuCtas = screen.getAllByRole('button', { name: /Начать/ });
    expect(menuCtas.length).toBeGreaterThanOrEqual(2);
  });

  it('mobile menu shows "Записать" CTA and auth actions when authenticated', async () => {
    useAuthStore.setState({ token: 'test-token' });
    mockProfile('/uploads/avatar.jpg');
    const user = userEvent.setup();
    renderNavbar();

    const hamburger = screen.getByRole('button', { name: '' });
    await user.click(hamburger);

    const menuCtas = screen.getAllByRole('button', { name: /Записать/ });
    expect(menuCtas.length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('Записи').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Профиль').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Выйти из аккаунта').length).toBeGreaterThanOrEqual(1);
  });

  it('mobile menu closes on matchMedia change past md breakpoint', async () => {
    const listeners: Array<(e: MediaQueryListEvent) => void> = [];
    const mockMql = {
      matches: false,
      addEventListener: (_: string, fn: (e: MediaQueryListEvent) => void) => { listeners.push(fn); },
      removeEventListener: vi.fn(),
    };
    vi.spyOn(window, 'matchMedia').mockReturnValue(mockMql as unknown as MediaQueryList);

    const user = userEvent.setup();
    renderNavbar();

    const hamburger = screen.getByRole('button', { name: '' });
    await user.click(hamburger);

    // Menu should be open — nav links visible in both top bar and overlay
    expect(screen.getAllByText('Как работает').length).toBe(2);

    // Simulate crossing the md breakpoint
    listeners.forEach((fn) => fn({ matches: true } as MediaQueryListEvent));

    // Menu should be closed — only the top bar nav links remain
    await vi.waitFor(() => {
      expect(screen.getAllByText('Как работает').length).toBe(1);
    });

    vi.restoreAllMocks();
  });
});
