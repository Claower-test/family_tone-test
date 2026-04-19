/**
 * @file Login page tests
 * @description Tests for login page rendering and form validation
 * @module app/(auth)/LoginPage.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router';

vi.mock('@/utils/constants', () => ({
  API_URL: 'http://localhost:3000/api',
  USE_MOCK_API: true,
}));

import { LoginPage } from '@/app/(auth)/LoginPage';
import { useAuthStore } from '@/stores/auth.store';

function renderLogin() {
  return render(
    <BrowserRouter>
      <LoginPage />
    </BrowserRouter>,
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null });
  });

  it('renders heading, email input, password input, and submit button', () => {
    renderLogin();

    expect(screen.getByText('Вход в FamilyTone')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Введите пароль')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /войти/i })).toBeInTheDocument();
  });

  it('renders link to register page', () => {
    renderLogin();

    const registerLink = screen.getByText('Зарегистрироваться');
    expect(registerLink).toBeInTheDocument();
    expect(registerLink.closest('a')).toHaveAttribute('href', '/register');
  });

  it('shows validation errors for empty fields on submit', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole('button', { name: /войти/i }));

    expect(screen.getByText('Введите email')).toBeInTheDocument();
    expect(screen.getByText('Введите пароль')).toBeInTheDocument();
  });

  it('shows error for invalid email format', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByPlaceholderText('you@example.com'), 'not-an-email');
    await user.type(screen.getByPlaceholderText('Введите пароль'), 'password123');
    await user.click(screen.getByRole('button', { name: /войти/i }));

    expect(screen.getByText('Некорректный формат email')).toBeInTheDocument();
  });

  it('shows error for short password', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByPlaceholderText('you@example.com'), 'test@example.com');
    await user.type(screen.getByPlaceholderText('Введите пароль'), '12345');
    await user.click(screen.getByRole('button', { name: /войти/i }));

    expect(screen.getByText('Пароль должен быть не менее 6 символов')).toBeInTheDocument();
  });

  it('shows API error for wrong credentials', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByPlaceholderText('you@example.com'), 'unknown@test.com');
    await user.type(screen.getByPlaceholderText('Введите пароль'), 'password123');
    await user.click(screen.getByRole('button', { name: /войти/i }));

    // Wait for the mock API delay
    const errorElement = await screen.findByText('Invalid email or password');
    expect(errorElement).toBeInTheDocument();
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    renderLogin();

    const passwordInput = screen.getByPlaceholderText('Введите пароль');
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Click the eye icon button
    const toggleButton = passwordInput.parentElement!.querySelector('button')!;
    await user.click(toggleButton);

    expect(passwordInput).toHaveAttribute('type', 'text');
  });
});
