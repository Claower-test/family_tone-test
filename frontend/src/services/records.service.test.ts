/**
 * @file Records service tests
 * @description Tests for records API service
 * @module services/records.service.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { recordsService } from '@/services/records.service';
import { api } from '@/services/api';

vi.mock('@/services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
}));

const mockRecords = [
  {
    id: 15,
    user_id: 7,
    title: 'История от 4/13/2026',
    file_path: '/api/uploads/rec_123.webm',
    duration: 7,
    is_public: false,
    hearts_count: 0,
    broken_hearts_count: 0,
    comments_count: 0,
    user_reaction: 0,
    is_following: false,
    created_at: '2026-04-13T14:25:17Z',
  },
];

describe('recordsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('calls GET /records and returns data', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockRecords });

      const result = await recordsService.getAll();

      expect(api.get).toHaveBeenCalledWith('/records');
      expect(result).toEqual(mockRecords);
    });

    it('returns empty array when no records', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: [] });

      const result = await recordsService.getAll();

      expect(result).toEqual([]);
    });

    it('propagates API errors', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Network error'));

      await expect(recordsService.getAll()).rejects.toThrow('Network error');
    });
  });

  describe('upload', () => {
    it('sends POST /records/upload with FormData', async () => {
      vi.mocked(api.post).mockResolvedValue({ data: mockRecords[0] });

      const blob = new Blob(['audio'], { type: 'audio/webm' });
      const result = await recordsService.upload(blob, 'Test Title', 10);

      expect(api.post).toHaveBeenCalledWith(
        '/records/upload',
        expect.any(FormData),
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      expect(result).toEqual(mockRecords[0]);
    });
  });
});
