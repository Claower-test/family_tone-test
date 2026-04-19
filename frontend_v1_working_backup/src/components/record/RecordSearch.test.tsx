/**
 * @file RecordSearch tests
 * @description Tests for search input component
 * @module components/record/RecordSearch.test
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecordSearch } from './RecordSearch';

describe('RecordSearch', () => {
  it('renders input with placeholder', () => {
    render(<RecordSearch value="" onChange={vi.fn()} />);

    expect(screen.getByPlaceholderText('Поиск по историям...')).toBeInTheDocument();
  });

  it('displays the current value', () => {
    render(<RecordSearch value="история" onChange={vi.fn()} />);

    expect(screen.getByDisplayValue('история')).toBeInTheDocument();
  });

  it('calls onChange when user types', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<RecordSearch value="" onChange={onChange} />);

    await user.type(screen.getByPlaceholderText('Поиск по историям...'), 'a');

    expect(onChange).toHaveBeenCalledWith('a');
  });
});
