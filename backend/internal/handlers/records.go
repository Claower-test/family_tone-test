package handlers

import (
	"log"
	"net/http"
	"strconv"

	"github.com/family_tone/internal/db"
	"github.com/family_tone/internal/models"
	"github.com/gin-gonic/gin"
)

func GetRecords(c *gin.Context) {
	userID, _ := c.Get("user_id")

	rows, err := db.DB.Query("SELECT id, user_id, title, file_path, duration, is_public, created_at FROM records WHERE user_id = ?", userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch records"})
		return
	}
	defer rows.Close()

	records := []models.Record{}
	for rows.Next() {
		var r models.Record
		if err := rows.Scan(&r.ID, &r.UserID, &r.Title, &r.FilePath, &r.Duration, &r.IsPublic, &r.CreatedAt); err != nil {
			continue
		}
		records = append(records, r)
	}

	c.JSON(http.StatusOK, records)
}

func CreateRecord(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var req models.Record
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := db.DB.Exec("INSERT INTO records (user_id, title, file_path, duration) VALUES (?, ?, ?, ?)", userID, req.Title, req.FilePath, req.Duration)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create record"})
		return
	}

	id, _ := result.LastInsertId()
	req.ID = int(id)
	req.UserID = userID.(int)

	c.JSON(http.StatusCreated, req)
}

func UploadRecord(c *gin.Context) {
	userID, _ := c.Get("user_id")
	title := c.PostForm("title")
	durationStr := c.PostForm("duration")
	isPublicStr := c.PostForm("is_public")
	
	duration, _ := strconv.Atoi(durationStr)
	isPublic := isPublicStr == "true"

	file, err := c.FormFile("audio")
	if err != nil {
		log.Printf("Upload error: audio file missing: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Audio file is required"})
		return
	}

	// Create unique filename
	filename := db.GenerateUniqueID() + ".webm"
	filepath := "./uploads/" + filename
	if err := c.SaveUploadedFile(file, filepath); err != nil {
		log.Printf("Upload error: failed to save file: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}

	result, err := db.DB.Exec("INSERT INTO records (user_id, title, file_path, duration, is_public) VALUES (?, ?, ?, ?, ?)", userID, title, "/api/uploads/"+filename, duration, isPublic)
	if err != nil {
		log.Printf("Upload error: failed to insert into DB: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save record metadata"})
		return
	}

	id, _ := result.LastInsertId()
	log.Printf("Record created: ID=%d, Title=%s, UserID=%v", id, title, userID)
	
	c.JSON(http.StatusCreated, gin.H{
		"id":        id,
		"title":     title,
		"file_path": "/api/uploads/" + filename,
		"duration":  duration,
	})
}

func TogglePublic(c *gin.Context) {
	userID, _ := c.Get("user_id")
	recordID := c.Param("id")

	var req struct {
		IsPublic bool `json:"is_public"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "is_public boolean required"})
		return
	}

	_, err := db.DB.Exec("UPDATE records SET is_public = ? WHERE id = ? AND user_id = ?", req.IsPublic, recordID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update record visibility"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Visibility updated"})
}

func GetPublicRecords(c *gin.Context) {
	// Try to get current userID if authenticated, but don't fail if not
	currentUserID, _ := c.Get("user_id")

	query := `
		SELECT 
			r.id, r.user_id, r.title, r.file_path, r.duration, r.is_public, r.created_at,
			u.name as author_name, u.avatar_url as author_avatar,
			(SELECT COUNT(*) FROM record_reactions WHERE record_id = r.id AND type = 1) as hearts_count,
			(SELECT COUNT(*) FROM record_reactions WHERE record_id = r.id AND type = -1) as broken_hearts_count,
			(SELECT COUNT(*) FROM comments WHERE record_id = r.id) as comments_count,
			COALESCE((SELECT type FROM record_reactions WHERE record_id = r.id AND user_id = ?), 0) as user_reaction,
			(SELECT EXISTS(SELECT 1 FROM follows WHERE following_id = r.user_id AND follower_id = ?)) as is_following
		FROM records r
		JOIN users u ON r.user_id = u.id
		WHERE r.is_public = 1
		ORDER BY r.created_at DESC`

	rows, err := db.DB.Query(query, currentUserID, currentUserID)
	if err != nil {
		log.Printf("Query error in GetPublicRecords: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch public records"})
		return
	}
	defer rows.Close()

	records := []models.Record{}
	for rows.Next() {
		var r models.Record
		if err := rows.Scan(
			&r.ID, &r.UserID, &r.Title, &r.FilePath, &r.Duration, &r.IsPublic, &r.CreatedAt,
			&r.AuthorName, &r.AuthorAvatar, &r.HeartsCount, &r.BrokenHeartsCount, &r.CommentsCount, &r.UserReaction, &r.IsFollowing,
		); err != nil {
			log.Printf("Scan error: %v", err)
			continue
		}
		records = append(records, r)
	}

	c.JSON(http.StatusOK, records)
}
