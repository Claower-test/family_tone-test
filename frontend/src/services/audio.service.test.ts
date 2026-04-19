/**
 * @file Audio service tests
 * @description Tests for audio recording service structure
 * @module services/audio.service.test
 */

import { describe, it, expect } from 'vitest';
import { audioService } from './audio.service';

describe('audioService', () => {
  it('exports a singleton with start, stop, and abort methods', () => {
    expect(typeof audioService.start).toBe('function');
    expect(typeof audioService.stop).toBe('function');
    expect(typeof audioService.abort).toBe('function');
  });

  it('stop rejects when not recording', async () => {
    await expect(audioService.stop()).rejects.toThrow('Not recording');
  });
});
