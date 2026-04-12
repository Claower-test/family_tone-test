/**
 * @file FaqAccordion component tests
 * @description Tests for single-open accordion behavior
 * @module components/ui/FaqAccordion.test
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FaqAccordion } from './FaqAccordion';

const ITEMS = [
  { question: 'What is Family Tone?', answer: 'A family voice recording app.' },
  { question: 'How does it work?', answer: 'You record and share stories.' },
  { question: 'Is it free?', answer: 'There is a free tier available.' },
];

function isOpen(question: string): boolean {
  const button = screen.getByText(question).closest('.faq-item')!;
  const content = button.querySelector('.faq-content')!;
  return content.classList.contains('open');
}

describe('FaqAccordion', () => {
  it('renders all question texts', () => {
    render(<FaqAccordion items={ITEMS} />);
    ITEMS.forEach((item) => {
      expect(screen.getByText(item.question)).toBeInTheDocument();
    });
  });

  it('opens answer on question click', async () => {
    const user = userEvent.setup();
    render(<FaqAccordion items={ITEMS} />);

    expect(isOpen('What is Family Tone?')).toBe(false);
    await user.click(screen.getByText('What is Family Tone?'));
    expect(isOpen('What is Family Tone?')).toBe(true);
  });

  it('closes answer on second click', async () => {
    const user = userEvent.setup();
    render(<FaqAccordion items={ITEMS} />);

    await user.click(screen.getByText('What is Family Tone?'));
    expect(isOpen('What is Family Tone?')).toBe(true);

    await user.click(screen.getByText('What is Family Tone?'));
    expect(isOpen('What is Family Tone?')).toBe(false);
  });

  it('keeps only one item open at a time', async () => {
    const user = userEvent.setup();
    render(<FaqAccordion items={ITEMS} />);

    await user.click(screen.getByText('What is Family Tone?'));
    expect(isOpen('What is Family Tone?')).toBe(true);

    await user.click(screen.getByText('How does it work?'));
    expect(isOpen('How does it work?')).toBe(true);
    expect(isOpen('What is Family Tone?')).toBe(false);
  });
});
