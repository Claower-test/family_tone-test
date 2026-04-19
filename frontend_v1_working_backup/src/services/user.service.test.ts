import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userService } from '@/services/user.service';
import { api } from '@/services/api';

vi.mock('@/services/api', () => ({
  api: {
    get: vi.fn(),
    put: vi.fn(),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
}));

const mockProfile = {
  id: 16,
  name: 'Test User',
  email: 'test@example.com',
  avatar_url: '',
  bio: 'hello',
  created_at: '2026-04-14T06:27:28Z',
  followers_count: 0,
  following_count: 0,
  records_count: 0,
};

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProfile', () => {
    it('calls GET /user/profile and returns data', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockProfile });

      const result = await userService.getProfile();

      expect(api.get).toHaveBeenCalledWith('/user/profile');
      expect(result).toEqual(mockProfile);
    });

    it('propagates API errors', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Network error'));

      await expect(userService.getProfile()).rejects.toThrow('Network error');
    });
  });

  describe('updateProfile', () => {
    it('sends PUT /user/profile with FormData containing name and bio', async () => {
      vi.mocked(api.put).mockResolvedValue({ data: { message: 'Profile updated' } });

      await userService.updateProfile({ name: 'New Name', bio: 'New bio' });

      expect(api.put).toHaveBeenCalledWith(
        '/user/profile',
        expect.any(FormData),
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );

      const formData = vi.mocked(api.put).mock.calls[0][1] as FormData;
      expect(formData.get('name')).toBe('New Name');
      expect(formData.get('bio')).toBe('New bio');
      expect(formData.get('avatar')).toBeNull();
    });

    it('includes avatar file in FormData when provided', async () => {
      vi.mocked(api.put).mockResolvedValue({ data: { avatar_url: '/avatars/test.svg', message: 'Profile updated' } });

      const file = new File(['img'], 'avatar.png', { type: 'image/png' });
      await userService.updateProfile({ name: 'Name', bio: 'Bio', avatar: file });

      const formData = vi.mocked(api.put).mock.calls[0][1] as FormData;
      expect(formData.get('avatar')).toBe(file);
    });

    it('propagates API errors', async () => {
      vi.mocked(api.put).mockRejectedValue(new Error('Server error'));

      await expect(userService.updateProfile({ name: 'x', bio: 'y' })).rejects.toThrow('Server error');
    });
  });
});
