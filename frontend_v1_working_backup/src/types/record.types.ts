export interface Record {
  id: number;
  user_id: number;
  title: string;
  file_path: string;
  duration: number;
  is_public: boolean;
  hearts_count: number;
  broken_hearts_count: number;
  comments_count: number;
  user_reaction: number;
  is_following: boolean;
  created_at: string;
  author_name?: string;
  author_avatar?: string;
}
