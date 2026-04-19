/**
 * @file BottomNavBar tests
 * @description Tests for bottom tab bar navigation
 * @module components/layout/BottomNavBar.test
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router';
import { BottomNavBar } from './BottomNavBar';

function renderNav(onRecord = vi.fn()) {
  return { ...render(
    <BrowserRouter>
      <BottomNavBar onRecord={onRecord} />
    </BrowserRouter>,
  ), onRecord };
}

describe('BottomNavBar', () => {
  it('renders without throwing', () => {
    expect(() => renderNav()).not.toThrow();
  });

  it('renders records tab with correct href', () => {
    renderNav();
    const recordsLink = screen.getByText('Записи').closest('a');
    expect(recordsLink).toHaveAttribute('href', '/records');
  });

  it('renders profile tab with correct href', () => {
    renderNav();
    const profileLink = screen.getByText('Профиль').closest('a');
    expect(profileLink).toHaveAttribute('href', '/profile');
  });

  it('renders record button', () => {
    renderNav();
    expect(screen.getByText('Запись')).toBeInTheDocument();
  });

  it('calls onRecord when record button is clicked', async () => {
    const user = userEvent.setup();
    const { onRecord } = renderNav();

    await user.click(screen.getByText('Запись'));

    expect(onRecord).toHaveBeenCalledOnce();
  });
});
