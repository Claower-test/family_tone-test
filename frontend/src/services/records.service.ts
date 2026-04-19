import { api } from '@/services/api';
import type { Record } from '@/types/record.types';

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
};
