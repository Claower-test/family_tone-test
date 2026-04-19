/**
 * @file cn utility tests
 * @description Tests for the cn utility — class merging, conditionals, edge cases
 * @module utils/cn.test
 */

import { describe, it, expect } from 'vitest';
import { cn } from './cn';

describe('cn', () => {
  it('merges tailwind classes (last wins)', () => {
    expect(cn('px-4', 'px-6')).toBe('px-6');
  });

  it('merges responsive tailwind classes', () => {
    expect(cn('text-sm', 'md:text-lg')).toBe('text-sm md:text-lg');
  });

  it('handles conditional classes with truthy values', () => {
    const isActive = true;
    expect(cn('base', isActive && 'active')).toBe('base active');
  });

  it('filters out falsy values', () => {
    const isHidden = false;
    expect(cn('base', isHidden && 'hidden', null, undefined, '')).toBe('base');
  });

  it('handles empty input', () => {
    expect(cn()).toBe('');
  });

  it('handles arrays of classes', () => {
    expect(cn(['px-4', 'py-2'], 'text-sm')).toBe('px-4 py-2 text-sm');
  });

  it('deduplicates identical classes', () => {
    expect(cn('px-4', 'px-4')).toBe('px-4');
  });
});
