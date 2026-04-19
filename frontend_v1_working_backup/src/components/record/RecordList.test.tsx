/**
 * @file RecordList tests
 * @description Tests for record list grouping and empty state
 * @module components/record/RecordList.test
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RecordList } from './RecordList';
import type { Record } from '@/types/record.types';

function makeRecord(overrides: Partial<Record> & { id: number; title: string; created_at: string }): Record {
  return {
    user_id: 1,
    file_path: '/api/uploads/test.webm',
    duration: 10,
    is_public: false,
    hearts_count: 0,
    broken_hearts_count: 0,
    comments_count: 0,
    user_reaction: 0,
    is_following: false,
    ...overrides,
  };
}

describe('RecordList', () => {
  it('shows empty state when no records', () => {
    render(<RecordList records={[]} playingId={null} onTogglePlay={vi.fn()} />);

    expect(screen.getByText('Ничего не найдено')).toBeInTheDocument();
    expect(screen.getByText('Попробуйте другой запрос')).toBeInTheDocument();
  });

  it('groups records by year', () => {
    const records = [
      makeRecord({ id: 1, title: 'Record A', created_at: '2026-04-13T10:00:00Z' }),
      makeRecord({ id: 2, title: 'Record B', created_at: '2025-12-01T10:00:00Z' }),
    ];

    render(<RecordList records={records} playingId={null} onTogglePlay={vi.fn()} />);

    expect(screen.getByText('2026')).toBeInTheDocument();
    expect(screen.getByText('2025')).toBeInTheDocument();
  });

  it('groups records by month within a year', () => {
    const records = [
      makeRecord({ id: 1, title: 'Record A', created_at: '2026-04-13T10:00:00Z' }),
      makeRecord({ id: 2, title: 'Record B', created_at: '2026-01-05T10:00:00Z' }),
    ];

    render(<RecordList records={records} playingId={null} onTogglePlay={vi.fn()} />);

    expect(screen.getByText('Апрель')).toBeInTheDocument();
    expect(screen.getByText('Январь')).toBeInTheDocument();
  });

  it('renders all record items', () => {
    const records = [
      makeRecord({ id: 1, title: 'First record', created_at: '2026-04-13T10:00:00Z' }),
      makeRecord({ id: 2, title: 'Second record', created_at: '2026-04-10T10:00:00Z' }),
    ];

    render(<RecordList records={records} playingId={null} onTogglePlay={vi.fn()} />);

    expect(screen.getByText('First record')).toBeInTheDocument();
    expect(screen.getByText('Second record')).toBeInTheDocument();
  });
});
