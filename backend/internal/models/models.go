package models

import "time"

type User struct {
	ID        int       `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Password  string    `json:"-"`
	AvatarURL string    `json:"avatar_url"`
	Bio       string    `json:"bio"`
	CreatedAt time.Time `json:"created_at"`
}

type ProfileUpdate struct {
	Name string `form:"name"`
	Bio  string `form:"bio"`
}

type ChangePasswordRequest struct {
	CurrentPassword string `json:"current_password" binding:"required"`
	NewPassword     string `json:"new_password" binding:"required,min=6"`
}

type Record struct {
	ID                int       `json:"id"`
	UserID            int       `json:"user_id"`
	Title             string    `json:"title"`
	FilePath          string    `json:"file_path"`
	Duration          int       `json:"duration"` // in seconds
	IsPublic          bool      `json:"is_public"`
	AuthorName        string    `json:"author_name,omitempty"`
	AuthorAvatar      string    `json:"author_avatar,omitempty"`
	HeartsCount       int       `json:"hearts_count"`
	BrokenHeartsCount int       `json:"broken_hearts_count"`
	CommentsCount     int       `json:"comments_count"`
	UserReaction      int       `json:"user_reaction"` // 1: heart, -1: broken, 0: none
	IsFollowing       bool      `json:"is_following"`
	CreatedAt         time.Time `json:"created_at"`
}

type Comment struct {
	ID                int       `json:"id"`
	UserID            int       `json:"user_id"`
	RecordID          int       `json:"record_id"`
	ParentID          *int      `json:"parent_id"`
	UserName          string    `json:"user_name,omitempty"`
	UserAvatar        string    `json:"user_avatar,omitempty"`
	Content           string    `json:"content"`
	HeartsCount       int       `json:"hearts_count"`
	BrokenHeartsCount int       `json:"broken_hearts_count"`
	UserReaction      int       `json:"user_reaction"` // 1: heart, -1: broken, 0: none
	Replies           []Comment `json:"replies,omitempty"`
	CreatedAt         time.Time `json:"created_at"`
}

type AuthResponse struct {
	User  User   `json:"user"`
	Token string `json:"token"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type RegisterRequest struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}
