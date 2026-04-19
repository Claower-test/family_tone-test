package handlers

import (
	"log"
	"os"
	"path/filepath"

	"github.com/family_tone/internal/db"
	"github.com/family_tone/internal/models"
	"github.com/family_tone/internal/utils"
	"github.com/gin-gonic/gin"
)

func GetUserInfo(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var profile struct {
		models.User
		FollowersCount int `json:"followers_count"`
		FollowingCount int `json:"following_count"`
		RecordsCount   int `json:"records_count"`
	}

	err := db.DB.QueryRow(`
		SELECT id, name, email, avatar_url, bio, created_at,
		(SELECT COUNT(*) FROM follows WHERE following_id = users.id) as followers,
		(SELECT COUNT(*) FROM follows WHERE follower_id = users.id) as following,
		(SELECT COUNT(*) FROM records WHERE user_id = users.id) as records_count
		FROM users WHERE id = ?`, 
		userID).Scan(
		&profile.ID, &profile.Name, &profile.Email, &profile.AvatarURL, &profile.Bio, &profile.CreatedAt,
		&profile.FollowersCount, &profile.FollowingCount, &profile.RecordsCount,
	)
	
	if err != nil {
		log.Printf("Error fetching user info: %v", err)
		utils.NotFound(c, "User not found")
		return
	}

	utils.Success(c, profile)
}

func UpdateProfile(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var req models.ProfileUpdate
	if err := c.ShouldBind(&req); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	// Handle avatar upload
	avatarURL := ""
	file, err := c.FormFile("avatar")
	if err == nil {
		// Create avatars directory if it doesn't exist
		if _, err := os.Stat("./uploads/avatars"); os.IsNotExist(err) {
			os.MkdirAll("./uploads/avatars", 0755)
		}

		filename := db.GenerateUniqueID() + filepath.Ext(file.Filename)
		savePath := filepath.Join("uploads", "avatars", filename)
		
		if err := c.SaveUploadedFile(file, savePath); err != nil {
			utils.InternalError(c, "Failed to save avatar")
			return
		}
		avatarURL = "/api/uploads/avatars/" + filename
	}

	// Update DB
	query := "UPDATE users SET name = ?, bio = ? WHERE id = ?"
	params := []interface{}{req.Name, req.Bio, userID}

	if avatarURL != "" {
		query = "UPDATE users SET name = ?, bio = ?, avatar_url = ? WHERE id = ?"
		params = []interface{}{req.Name, req.Bio, avatarURL, userID}
	}

	_, err = db.DB.Exec(query, params...)
	if err != nil {
		utils.InternalError(c, "Failed to update profile")
		return
	}

	utils.Success(c, gin.H{"message": "Profile updated", "avatar_url": avatarURL})
}

func GetUserProfile(c *gin.Context) {
	profileID := c.Param("id")
	currentUserID, _ := c.Get("user_id")

	var profile struct {
		models.User
		FollowersCount int `json:"followers_count"`
		FollowingCount int `json:"following_count"`
		RecordsCount   int `json:"records_count"`
		IsFollowing    bool `json:"is_following"`
		Records        []models.Record `json:"records"`
	}

	// Get basic info
	err := db.DB.QueryRow(`
		SELECT id, name, avatar_url, bio, created_at,
		(SELECT COUNT(*) FROM follows WHERE following_id = users.id) as followers,
		(SELECT COUNT(*) FROM follows WHERE follower_id = users.id) as following,
		(SELECT COUNT(*) FROM records WHERE user_id = users.id AND is_public = 1) as records_count,
		EXISTS(SELECT 1 FROM follows WHERE following_id = users.id AND follower_id = ?) as is_following
		FROM users WHERE id = ?`, 
	currentUserID, profileID).Scan(
		&profile.ID, &profile.Name, &profile.AvatarURL, &profile.Bio, &profile.CreatedAt,
		&profile.FollowersCount, &profile.FollowingCount, &profile.RecordsCount, &profile.IsFollowing,
	)
	if err != nil {
		log.Printf("Error fetching user profile: %v", err)
		utils.NotFound(c, "User not found")
		return
	}

	// Get public records
	rows, err := db.DB.Query(`
		SELECT 
			r.id, r.user_id, r.title, r.file_path, r.duration, r.is_public, r.created_at,
			(SELECT COUNT(*) FROM record_reactions WHERE record_id = r.id AND type = 1) as hearts_count,
			(SELECT COUNT(*) FROM record_reactions WHERE record_id = r.id AND type = -1) as broken_hearts_count,
			(SELECT COUNT(*) FROM comments WHERE record_id = r.id) as comments_count,
			COALESCE((SELECT type FROM record_reactions WHERE record_id = r.id AND user_id = ?), 0) as user_reaction
		FROM records r 
		WHERE r.user_id = ? AND r.is_public = 1 
		ORDER BY r.created_at DESC`, 
	currentUserID, profileID)
	
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var r models.Record
			if err := rows.Scan(
				&r.ID, &r.UserID, &r.Title, &r.FilePath, &r.Duration, &r.IsPublic, &r.CreatedAt,
				&r.HeartsCount, &r.BrokenHeartsCount, &r.CommentsCount, &r.UserReaction,
			); err != nil {
				continue
			}
			r.AuthorName = profile.Name
			profile.Records = append(profile.Records, r)
		}
	}

	utils.Success(c, profile)
}
