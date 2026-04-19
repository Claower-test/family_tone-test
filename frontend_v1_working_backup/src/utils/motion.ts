/**
 * @file Motion animation presets
 * @description Reusable Framer Motion variants and transition presets
 * @module utils/motion
 */

export const transitions = {
  smooth: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const },
  scale: { duration: 1.1, ease: [0.16, 1, 0.3, 1] as const },
} as const;

export const revealUp = {
  initial: { opacity: 0, y: 50 },
  whileInView: { opacity: 1, y: 0 },
} as const;

export const revealScale = {
  initial: { opacity: 0, scale: 0.95 },
  whileInView: { opacity: 1, scale: 1 },
} as const;

export function staggerDelay(index: number, base = 0.1): number {
  return index * base;
}
