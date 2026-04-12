/**
 * @file cn utility
 * @description Combines clsx and tailwind-merge for conditional class names
 * @module utils/cn
 */

import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
