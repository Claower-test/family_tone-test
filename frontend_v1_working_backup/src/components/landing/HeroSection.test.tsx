import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router';
import { HeroSection } from './HeroSection';
import { useAuthStore } from '@/stores/auth.store';

function renderHero() {
  return render(
    <BrowserRouter>
      <HeroSection />
    </BrowserRouter>,
  );
}

describe('HeroSection CTA', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null });
  });

  it('shows "Записать первую историю" and navigates to /register when no token', async () => {
    const user = userEvent.setup();
    renderHero();

    const cta = screen.getByRole('button', { name: /Записать первую историю/i });
    expect(cta).toBeInTheDocument();

    await user.click(cta);
    expect(window.location.pathname).toBe('/register');
  });

  it('shows "Записать историю" and navigates to /records when token exists', async () => {
    useAuthStore.setState({ token: 'test-token' });
    const user = userEvent.setup();
    renderHero();

    const cta = screen.getByRole('button', { name: /Записать историю/i });
    expect(cta).toBeInTheDocument();

    await user.click(cta);
    expect(window.location.pathname).toBe('/records');
  });
});
