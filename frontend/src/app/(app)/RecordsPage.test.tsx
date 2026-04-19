/**
 * @file RecordsPage tests
 * @description Tests for records page rendering, loading, error, and search
 * @module app/(app)/RecordsPage.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RecordsPage } from './RecordsPage';
import * as useRecordsModule from '@/hooks/useRecords';
import type { Record } from '@/types/record.types';

vi.mock('@/hooks/useRecords');

function makeRecord(overrides: Partial<Record> & { id: number; title: string; created_at: string }): Record {
  return {
    user_id: 1,
    file_path: '/api/uploads/test.webm',
    duration: 60,
    is_public: false,
    hearts_count: 0,
    broken_hearts_count: 0,
    comments_count: 0,
    user_reaction: 0,
    is_following: false,
    ...overrides,
  };
}

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <RecordsPage />
      </BrowserRouter>
    </QueryClientProvider>,
  );
}

describe('RecordsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state', () => {
    vi.mocked(useRecordsModule.useRecords).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as ReturnType<typeof useRecordsModule.useRecords>);

    renderPage();

    expect(screen.queryByText('Мои истории')).not.toBeInTheDocument();
  });

  it('shows error state', () => {
    vi.mocked(useRecordsModule.useRecords).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed'),
    } as ReturnType<typeof useRecordsModule.useRecords>);

    renderPage();

    expect(screen.getByText('Не удалось загрузить записи')).toBeInTheDocument();
  });

  it('renders records page with header and stats', () => {
    const records = [
      makeRecord({ id: 1, title: 'Test Record', created_at: '2026-04-13T10:00:00Z', duration: 120 }),
    ];

    vi.mocked(useRecordsModule.useRecords).mockReturnValue({
      data: records,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useRecordsModule.useRecords>);

    renderPage();

    expect(screen.getByText('Мои истории')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Test Record')).toBeInTheDocument();
  });

  it('filters records by search input', async () => {
    const user = userEvent.setup();
    const records = [
      makeRecord({ id: 1, title: 'Моя история', created_at: '2026-04-13T10:00:00Z' }),
      makeRecord({ id: 2, title: 'Другая запись', created_at: '2026-04-10T10:00:00Z' }),
    ];

    vi.mocked(useRecordsModule.useRecords).mockReturnValue({
      data: records,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useRecordsModule.useRecords>);

    renderPage();

    await user.type(screen.getByPlaceholderText('Поиск по историям...'), 'история');

    expect(screen.getByText('Моя история')).toBeInTheDocument();
    expect(screen.queryByText('Другая запись')).not.toBeInTheDocument();
  });
});
