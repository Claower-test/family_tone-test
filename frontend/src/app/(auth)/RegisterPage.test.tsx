/**
 * @file Register page tests
 * @description Tests for register page rendering and form validation
 * @module app/(auth)/RegisterPage.test
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router';
import { RegisterPage } from '@/app/(auth)/RegisterPage';
import { useAuthStore } from '@/stores/auth.store';

function renderRegister() {
  return render(
    <BrowserRouter>
      <RegisterPage />
    </BrowserRouter>,
  );
}

describe('RegisterPage', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null });
  });

  it('renders heading, all inputs, and submit button', () => {
    renderRegister();

    expect(screen.getByText('Создайте аккаунт')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ваше имя')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Придумайте пароль')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Повторите пароль')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /создать аккаунт/i })).toBeInTheDocument();
  });

  it('renders link to login page', () => {
    renderRegister();

    const loginLink = screen.getByText('Войти');
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
  });

  it('shows error for short name', async () => {
    const user = userEvent.setup();
    renderRegister();

    await user.type(screen.getByPlaceholderText('Ваше имя'), 'А');
    await user.type(screen.getByPlaceholderText('you@example.com'), 'test@example.com');
    await user.type(screen.getByPlaceholderText('Придумайте пароль'), 'password123');
    await user.type(screen.getByPlaceholderText('Повторите пароль'), 'password123');
    await user.click(screen.getByRole('button', { name: /создать аккаунт/i }));

    expect(screen.getByText('Имя должно быть не менее 2 символов')).toBeInTheDocument();
  });

  it('shows error for mismatched passwords', async () => {
    const user = userEvent.setup();
    renderRegister();

    await user.type(screen.getByPlaceholderText('Ваше имя'), 'Test');
    await user.type(screen.getByPlaceholderText('you@example.com'), 'test@example.com');
    await user.type(screen.getByPlaceholderText('Придумайте пароль'), 'password123');
    await user.type(screen.getByPlaceholderText('Повторите пароль'), 'different123');
    await user.click(screen.getByRole('button', { name: /создать аккаунт/i }));

    expect(screen.getByText('Пароли не совпадают')).toBeInTheDocument();
  });

  it('shows error for short password', async () => {
    const user = userEvent.setup();
    renderRegister();

    await user.type(screen.getByPlaceholderText('Ваше имя'), 'Test');
    await user.type(screen.getByPlaceholderText('you@example.com'), 'test@example.com');
    await user.type(screen.getByPlaceholderText('Придумайте пароль'), '12345');
    await user.type(screen.getByPlaceholderText('Повторите пароль'), '12345');
    await user.click(screen.getByRole('button', { name: /создать аккаунт/i }));

    expect(screen.getByText('Пароль должен быть не менее 6 символов')).toBeInTheDocument();
  });
});
