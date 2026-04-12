export interface User {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
}

export interface Record {
  id: number;
  user_id: number;
  title: string;
  file_path: string;
  duration: number;
  is_public: boolean;
  author_name?: string;
  author_avatar?: string;
  hearts_count: number;
  broken_hearts_count: number;
  comments_count: number;
  user_reaction: number; // 1: heart, -1: broken, 0: none
  is_following: boolean;
  created_at: string;
}

export interface Comment {
  id: number;
  user_id: number;
  record_id: number;
  parent_id?: number | null;
  user_name?: string;
  user_avatar?: string;
  content: string;
  hearts_count: number;
  broken_hearts_count: number;
  user_reaction: number; // 1: heart, -1: broken, 0: none
  replies?: Comment[];
  created_at: string;
}
