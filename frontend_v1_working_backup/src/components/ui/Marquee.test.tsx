/**
 * @file Marquee component tests
 * @description Tests for infinite horizontal scroll ticker
 * @module components/ui/Marquee.test
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Marquee } from './Marquee';

describe('Marquee', () => {
  it('renders children exactly twice', () => {
    render(
      <Marquee>
        <span>Item A</span>
        <span>Item B</span>
      </Marquee>,
    );

    const items = screen.getAllByText('Item A');
    expect(items).toHaveLength(2);

    const itemsB = screen.getAllByText('Item B');
    expect(itemsB).toHaveLength(2);
  });

  it('renders single child twice', () => {
    render(
      <Marquee>
        <span>Only Item</span>
      </Marquee>,
    );

    expect(screen.getAllByText('Only Item')).toHaveLength(2);
  });
});
