/**
 * @file RecordStats tests
 * @description Tests for stats grid component
 * @module components/record/RecordStats.test
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RecordStats } from './RecordStats';

describe('RecordStats', () => {
  it('renders record count', () => {
    render(<RecordStats count={47} totalSeconds={0} />);

    expect(screen.getByText('47')).toBeInTheDocument();
    expect(screen.getByText('Записей')).toBeInTheDocument();
  });

  it('formats total seconds as hh:mm:ss', () => {
    render(<RecordStats count={0} totalSeconds={3600 + 1440 + 5} />);

    expect(screen.getByText('01:24:05')).toBeInTheDocument();
    expect(screen.getByText('Часов')).toBeInTheDocument();
  });

  it('shows 00:00:00 for zero seconds', () => {
    render(<RecordStats count={0} totalSeconds={0} />);

    expect(screen.getByText('00:00:00')).toBeInTheDocument();
  });
});
