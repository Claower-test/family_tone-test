import { api } from '@/services/api';
import type { User } from '@/types/user.types';

async function getProfile(): Promise<User> {
  const { data } = await api.get<User>('/user/profile');
  return data;
}

async function updateProfile(payload: { name: string; bio: string; avatar?: File }): Promise<void> {
  const formData = new FormData();
  formData.append('name', payload.name);
  formData.append('bio', payload.bio);
  if (payload.avatar) {
    formData.append('avatar', payload.avatar);
  }
  await api.put('/user/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

async function changePassword(current_password: string, new_password: string): Promise<void> {
  await api.put('/user/password', { current_password, new_password });
}

export const userService = { getProfile, updateProfile, changePassword };
