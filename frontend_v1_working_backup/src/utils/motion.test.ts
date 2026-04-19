/**
 * @file Motion animation presets tests
 * @description Tests for Framer Motion variants, transitions, and stagger utility
 * @module utils/motion.test
 */

import { describe, it, expect } from 'vitest';
import { transitions, revealUp, revealScale, staggerDelay } from './motion';

describe('transitions', () => {
  it('has smooth transition with correct shape', () => {
    expect(transitions.smooth).toEqual({
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1],
    });
  });

  it('has scale transition with correct shape', () => {
    expect(transitions.scale).toEqual({
      duration: 1.1,
      ease: [0.16, 1, 0.3, 1],
    });
  });
});

describe('revealUp', () => {
  it('has initial state with opacity 0 and y offset', () => {
    expect(revealUp.initial).toEqual({ opacity: 0, y: 50 });
  });

  it('has whileInView state with opacity 1 and y 0', () => {
    expect(revealUp.whileInView).toEqual({ opacity: 1, y: 0 });
  });
});

describe('revealScale', () => {
  it('has initial state with opacity 0 and scale < 1', () => {
    expect(revealScale.initial).toEqual({ opacity: 0, scale: 0.95 });
  });

  it('has whileInView state with opacity 1 and scale 1', () => {
    expect(revealScale.whileInView).toEqual({ opacity: 1, scale: 1 });
  });
});

describe('staggerDelay', () => {
  it('returns 0 for index 0 with default base', () => {
    expect(staggerDelay(0)).toBe(0);
  });

  it('returns 0.1 for index 1 with default base', () => {
    expect(staggerDelay(1)).toBe(0.1);
  });

  it('returns 0.3 for index 3 with default base', () => {
    expect(staggerDelay(3)).toBeCloseTo(0.3);
  });

  it('uses custom base when provided', () => {
    expect(staggerDelay(2, 0.2)).toBe(0.4);
  });

  it('handles custom base of 0.05', () => {
    expect(staggerDelay(4, 0.05)).toBe(0.2);
  });
});
