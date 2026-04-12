import { api } from './api';
import type { User } from '../models/models';

export interface PublicProfile extends User {
  followers_count: number;
  following_count: number;
  records_count: number;
  is_following: boolean;
  records: any[];
}

export interface UserProfile extends User {
  followers_count: number;
  following_count: number;
  records_count: number;
}

async function getProfile(): Promise<UserProfile> {
  const { data } = await api.get<UserProfile>('user/profile');
  return data;
}

async function updateProfile(name: string, bio: string, avatarFile?: File): Promise<{ message: string; avatar_url: string }> {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('bio', bio);
  if (avatarFile) {
    formData.append('avatar', avatarFile);
  }

  const { data } = await api.put<{ message: string; avatar_url: string }>('user/profile', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
}

async function getPublicProfile(id: number): Promise<PublicProfile> {
  const { data } = await api.get<PublicProfile>(`users/${id}/profile`);
  return data;
}

async function changePassword(current: string, next: string): Promise<{ message: string }> {
  const { data } = await api.put<{ message: string }>('user/password', {
    current_password: current,
    new_password: next,
  });
  return data;
}

export const usersService = {
  getProfile,
  updateProfile,
  getPublicProfile,
  changePassword,
};
