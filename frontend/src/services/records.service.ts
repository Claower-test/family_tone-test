import { api } from '@/services/api';
import type { Record } from '@/types/record.types';
import type { Comment } from '@/models/models';

export const recordsService = {
  async getAll(): Promise<Record[]> {
    const { data } = await api.get<Record[]>('/records');
    return data;
  },

  async upload(audio: Blob, title: string, duration: number): Promise<Record> {
    const form = new FormData();
    form.append('title', title);
    form.append('duration', String(duration));
    form.append('is_public', 'false');
    form.append('audio', audio, 'record.webm');

    const { data } = await api.post<Record>('/records/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async getPublicRecords(): Promise<Record[]> {
    const { data } = await api.get<Record[]>('/records/public');
    return data;
  },

  async toggleReaction(type: 'record' | 'comment', id: number, reactionType: number): Promise<{ message: string }> {
    const endpoint = type === 'record' ? `/records/${id}/reaction` : `/comment/${id}/reaction`;
    const { data } = await api.post<{ message: string }>(endpoint, { type: reactionType });
    return data;
  },

  async toggleFollow(userId: number): Promise<{ following: boolean }> {
    const { data } = await api.post<{ following: boolean }>(`/users/${userId}/follow`);
    return data;
  },

  async getComments(recordId: number): Promise<Comment[]> {
    const { data } = await api.get<Comment[]>(`/records/${recordId}/comments`);
    return data;
  },

  async addComment(recordId: number, content: string, parentId?: number): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>(`/records/${recordId}/comments`, {
      content,
      parent_id: parentId,
    });
    return data;
  },

  async updateComment(id: number, content: string): Promise<{ message: string }> {
    const { data } = await api.put<{ message: string }>(`/comments/${id}`, { content });
    return data;
  },

  async deleteComment(id: number): Promise<{ message: string }> {
    const { data } = await api.delete<{ message: string }>(`/comments/${id}`);
    return data;
  },

  async togglePublic(id: number): Promise<{ is_public: boolean }> {
    const { data } = await api.post<{ is_public: boolean }>(`/records/${id}/toggle-public`);
    return data;
  },
};
