/**
 * @file RecordItem tests
 * @description Tests for record item component
 * @module components/record/RecordItem.test
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecordItem } from './RecordItem';
import type { Record } from '@/types/record.types';

const mockRecord: Record = {
  id: 15,
  user_id: 7,
  title: 'История от 4/13/2026',
  file_path: '/api/uploads/rec_123.webm',
  duration: 67,
  is_public: false,
  hearts_count: 0,
  broken_hearts_count: 0,
  comments_count: 0,
  user_reaction: 0,
  is_following: false,
  created_at: '2026-04-13T14:25:17Z',
};

describe('RecordItem', () => {
  it('renders title', () => {
    render(<RecordItem record={mockRecord} isPlaying={false} onTogglePlay={vi.fn()} />);

    expect(screen.getByText('История от 4/13/2026')).toBeInTheDocument();
  });

  it('renders formatted duration as m:ss', () => {
    render(<RecordItem record={mockRecord} isPlaying={false} onTogglePlay={vi.fn()} />);

    expect(screen.getByText('1:07')).toBeInTheDocument();
  });

  it('renders formatted date with Russian month', () => {
    render(<RecordItem record={mockRecord} isPlaying={false} onTogglePlay={vi.fn()} />);

    expect(screen.getByText('13 Апрель')).toBeInTheDocument();
  });

  it('calls onTogglePlay with record id on click', async () => {
    const user = userEvent.setup();
    const onTogglePlay = vi.fn();
    render(<RecordItem record={mockRecord} isPlaying={false} onTogglePlay={onTogglePlay} />);

    await user.click(screen.getByText('История от 4/13/2026'));

    expect(onTogglePlay).toHaveBeenCalledWith(15);
  });

  it('shows animated bars when playing', () => {
    const { container } = render(
      <RecordItem record={mockRecord} isPlaying={true} onTogglePlay={vi.fn()} />,
    );

    expect(container.querySelectorAll('.play-bar')).toHaveLength(3);
  });

  it('shows play icon when not playing', () => {
    const { container } = render(
      <RecordItem record={mockRecord} isPlaying={false} onTogglePlay={vi.fn()} />,
    );

    expect(container.querySelectorAll('.play-bar')).toHaveLength(0);
  });
});
