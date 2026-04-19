/**
 * @file useRecords hook tests
 * @description Tests for records query hook
 * @module hooks/useRecords.test
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { useRecords } from './useRecords';
import { recordsService } from '@/services/records.service';

vi.mock('@/services/records.service', () => ({
  recordsService: {
    getAll: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useRecords', () => {
  it('returns records on success', async () => {
    const mockRecords = [
      { id: 1, title: 'Test', created_at: '2026-04-13T10:00:00Z', duration: 10 },
    ];
    vi.mocked(recordsService.getAll).mockResolvedValue(mockRecords as never);

    const { result } = renderHook(() => useRecords(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockRecords);
  });

  it('returns error on failure', async () => {
    vi.mocked(recordsService.getAll).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useRecords(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Network error');
  });

  it('calls recordsService.getAll', async () => {
    vi.mocked(recordsService.getAll).mockResolvedValue([]);

    const { result } = renderHook(() => useRecords(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(recordsService.getAll).toHaveBeenCalled();
  });
});
