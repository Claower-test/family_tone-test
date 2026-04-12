/**
 * @file Records service
 * @description API calls for managing audio records
 * @module services/records
 */

import { api } from '@/services/api';
import type { Record, Comment } from '@/models/models';

async function getRecords(): Promise<Record[]> {
  const { data } = await api.get<Record[]>('records');
  return data;
}

async function createRecord(title: string): Promise<Record> {
  // Simulating record creation with metadata
  const { data } = await api.post<Record>('records', {
    title,
    duration: Math.floor(Math.random() * 300) + 30, // Random duration 30-330s
    file_path: '/uploads/sample.mp3', // Placeholder
  });
  return data;
}

async function uploadRecord(title: string, duration: number, isPublic: boolean, audioBlob: Blob): Promise<Record> {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('duration', Math.round(duration).toString());
  formData.append('is_public', isPublic.toString());
  formData.append('audio', audioBlob, 'record.webm');

  const { data } = await api.post<Record>('records/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

async function togglePublic(id: number, isPublic: boolean): Promise<void> {
  await api.post(`records/${id}/toggle-public`, { is_public: isPublic });
}

async function getPublicRecords(): Promise<Record[]> {
  const { data } = await api.get<Record[]>('records/public');
  return data;
}

/**
 * Toggle heart (1) or broken heart (-1) on record or comment
 */
async function toggleReaction(type: 'record' | 'comment', id: number, reactionType: number): Promise<void> {
  await api.post(`${type}/${id}/reaction`, { type: reactionType });
}

async function getComments(recordId: number): Promise<Comment[]> {
  const { data } = await api.get<Comment[]>(`records/${recordId}/comments`);
  return data;
}

async function addComment(recordId: number, content: string, parentId?: number): Promise<void> {
  await api.post(`records/${recordId}/comments`, { content, parent_id: parentId });
}

async function updateComment(commentId: number, content: string): Promise<void> {
  await api.put(`comments/${commentId}`, { content });
}

async function deleteComment(commentId: number): Promise<void> {
  await api.delete(`comments/${commentId}`);
}

async function toggleFollow(userId: number): Promise<{ following: boolean }> {
  const { data } = await api.post<{ following: boolean }>(`users/${userId}/follow`);
  return data;
}

export const recordsService = {
  getRecords,
  createRecord,
  uploadRecord,
  togglePublic,
  getPublicRecords,
  toggleReaction,
  getComments,
  addComment,
  updateComment,
  deleteComment,
  toggleFollow,
};
